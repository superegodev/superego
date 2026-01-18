import { type ToolCall, ToolName, type ToolResult } from "@superego/backend";
import { valibotSchemas } from "@superego/schema";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import * as v from "valibot";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
import makeResultError from "../../../makers/makeResultError.js";
import makeValidationIssues from "../../../makers/makeValidationIssues.js";
import InferenceService from "../../../requirements/InferenceService.js";
import type CollectionsCreateMany from "../../../usecases/collections/CreateMany.js";
import isEmpty from "../../../utils/isEmpty.js";
import validateTableColumns from "../utils/validateTableColumns.js";

const stubContentSummaryGetter = {
  source: "export default function stub() { return {}; }",
  compiled: "export default function stub() { return {}; }",
};

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.SuggestCollectionsDefinitions {
    return toolCall.tool === ToolName.SuggestCollectionsDefinitions;
  },

  async exec(
    toolCall: ToolCall.SuggestCollectionsDefinitions,
    collectionsCreateMany: CollectionsCreateMany,
  ): Promise<ToolResult.SuggestCollectionsDefinitions> {
    const { collections } = toolCall.input;

    const createManyResult = await collectionsCreateMany.exec(
      collections.map(({ settings, schema }) => ({
        settings: {
          ...settings,
          defaultCollectionViewAppId: null,
          assistantInstructions: null,
        },
        schema,
        versionSettings: {
          contentSummaryGetter: stubContentSummaryGetter,
          // TODO_FINGERPRINT: ask the LLM to generate one
          contentFingerprintGetter: null,
        },
      })),
      { dryRun: true },
    );

    if (
      createManyResult.error &&
      (createManyResult.error.name === "UnexpectedError" ||
        createManyResult.error.name === "CollectionCategoryNotFound" ||
        createManyResult.error.name === "AppNotFound" ||
        createManyResult.error.name === "ContentFingerprintGetterNotValid" ||
        createManyResult.error.name === "ContentSummaryGetterNotValid")
    ) {
      throw new UnexpectedAssistantError(
        [
          `Dry-run creating collections failed with ${createManyResult.error.name}.`,
          createManyResult.error.name === "UnexpectedError"
            ? ` Cause: ${createManyResult.error.details.cause}`
            : "",
        ].join(""),
      );
    }
    if (createManyResult.error) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: makeUnsuccessfulResult(createManyResult.error),
      };
    }

    // Validate table columns and example documents.
    for (const collection of collections) {
      const { schema, tableColumns, exampleDocument } = collection;

      const tableColumnIssues = validateTableColumns(schema, tableColumns);
      if (!isEmpty(tableColumnIssues)) {
        return {
          tool: toolCall.tool,
          toolCallId: toolCall.id,
          output: makeUnsuccessfulResult(
            makeResultError("TableColumnsNotValid", {
              issues: tableColumnIssues,
            }),
          ),
        };
      }

      const exampleDocumentValidationResult = v.safeParse(
        valibotSchemas.content(schema),
        exampleDocument,
      );
      if (!exampleDocumentValidationResult.success) {
        return {
          tool: toolCall.tool,
          toolCallId: toolCall.id,
          output: makeUnsuccessfulResult(
            makeResultError("ExampleDocumentNotValid", {
              issues: makeValidationIssues(
                exampleDocumentValidationResult.issues,
              ),
            }),
          ),
        };
      }
    }

    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: makeSuccessfulResult(null),
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.SuggestCollectionsDefinitions,
      description: `
Suggests one or more collection definitions to the user. This is ONLY a
suggestion. The user will review it and decide whether to create them or not.
This tool DOES NOT create the collections.

When suggesting multiple related collections, you can use
"SuggestedCollection_<index>" as the collectionId in DocumentRef types to
reference other collections being suggested in the same call.
      `.trim(),
      inputSchema: {
        type: "object",
        properties: {
          collections: {
            description:
              "Array of collection definitions to suggest. Use this to suggest multiple related collections at once.",
            type: "array",
            items: {
              type: "object",
              properties: {
                settings: {
                  type: "object",
                  properties: {
                    name: {
                      description:
                        "The name of the collection. Should be concise, user-friendly, and meaningful. 3 words max. Follow the style of the other collections the user has.",
                      type: "string",
                      minLength: 1,
                      maxLength: 64,
                    },
                    icon: {
                      description:
                        "A single emoji for the collection (can be a ZWJ sequence). Should be meaningful and representative.",
                      type: ["string", "null"],
                    },
                    description: {
                      description:
                        "A short description for the collection. 20 words max.",
                      type: ["string", "null"],
                    },
                    collectionCategoryId: {
                      description:
                        "The ID of the collection category under which the collection should go. Explicitly set to null if there's no suitable collection category.",
                      type: ["string", "null"],
                    },
                  },
                  required: ["name", "icon", "description"],
                  additionalProperties: false,
                },
                schema: {
                  description: "The schema for the collection.",
                  type: "object",
                  additionalProperties: true,
                },
                tableColumns: {
                  description: `
Columns to display in the UI table used to show the documents in the collection.
There should be a column for all the most important properties of the
collection, but define 5 columns at most. Important: only primitive properties
can be selected; Files, JsonObjects, Lists, Structs, and DocumentRefs are **NOT
ALLOWED**.
                  `.trim(),
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      header: {
                        description: "Header of the column",
                        type: "string",
                      },
                      path: {
                        description:
                          "Path of the primitive property to show in the column.",
                        examples: [
                          "primitiveProperty",
                          "nested.primitiveProperty",
                          "list.0.elementPrimitiveProperty",
                        ],
                        type: "string",
                      },
                    },
                    required: ["header", "path"],
                    additionalProperties: false,
                    minItems: 1,
                    maxItems: 5,
                  },
                },
                exampleDocument: {
                  description: `
An example document in the collection. Make it as simple as possible. Must be
valid. Valid DocumentRef = { collectionId: "SuggestedCollection_<index>", documentId: "Document_example" }.
                  `.trim(),
                  type: "object",
                  additionalProperties: true,
                },
              },
              required: [
                "settings",
                "schema",
                "tableColumns",
                "exampleDocument",
              ],
              additionalProperties: false,
            },
            minItems: 1,
          },
        },
        required: ["collections"],
        additionalProperties: false,
      },
    };
  },
};
