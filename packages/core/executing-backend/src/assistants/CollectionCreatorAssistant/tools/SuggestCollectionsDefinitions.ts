import { type ToolCall, ToolName, type ToolResult } from "@superego/backend";
import { valibotSchemas } from "@superego/schema";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import pMap from "p-map";
import * as v from "valibot";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
import makeResultError from "../../../makers/makeResultError.js";
import makeValidationIssues from "../../../makers/makeValidationIssues.js";
import InferenceService from "../../../requirements/InferenceService.js";
import type CollectionsCreateMany from "../../../usecases/collections/CreateMany.js";
import type InferenceImplementTypescriptModule from "../../../usecases/inference/ImplementTypescriptModule.js";
import getImplementContentBlockingKeysGetterSpec from "../utils/getImplementContentBlockingKeysGetterSpec.js";
import getImplementContentSummaryGetterSpec from "../utils/getImplementContentSummaryGetterSpec.js";

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
    inferenceImplementTypescriptModule: InferenceImplementTypescriptModule,
  ): Promise<ToolResult.SuggestCollectionsDefinitions> {
    const { collections } = toolCall.input;

    // Validate schema and settings with dry-run.
    const createManyResult = await collectionsCreateMany.exec(
      collections.map(({ settings, schema }) => ({
        settings: {
          ...settings,
          defaultCollectionViewAppId: null,
          assistantInstructions: null,
        },
        schema,
        versionSettings: {
          contentBlockingKeysGetter: null,
          contentSummaryGetter: stubContentSummaryGetter,
          defaultDocumentViewUiOptions: null,
        },
      })),
      { dryRun: true },
    );

    if (
      createManyResult.error &&
      (createManyResult.error.name === "UnexpectedError" ||
        createManyResult.error.name === "CollectionCategoryNotFound" ||
        createManyResult.error.name === "AppNotFound" ||
        createManyResult.error.name === "ContentBlockingKeysGetterNotValid" ||
        createManyResult.error.name === "ContentSummaryGetterNotValid" ||
        createManyResult.error.name === "DefaultDocumentViewUiOptionsNotValid")
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

    // Validate example documents.
    for (const collection of collections) {
      const { schema, exampleDocument } = collection;
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

    // Generate contentBlockingKeysGetter and contentSummaryGetter.
    const collectionArtifacts = await pMap(
      collections,
      async (collection) => {
        const { schema } = collection;

        const [contentBlockingKeysGetterResult, contentSummaryGetterResult] =
          await Promise.all([
            inferenceImplementTypescriptModule.exec(
              getImplementContentBlockingKeysGetterSpec(schema),
            ),
            inferenceImplementTypescriptModule.exec(
              getImplementContentSummaryGetterSpec(schema),
            ),
          ]);

        if (!contentBlockingKeysGetterResult.success) {
          throw new UnexpectedAssistantError(
            `Failed to generate contentBlockingKeysGetter: ${contentBlockingKeysGetterResult.error.name}`,
          );
        }
        if (!contentSummaryGetterResult.success) {
          throw new UnexpectedAssistantError(
            `Failed to generate contentSummaryGetter: ${contentSummaryGetterResult.error.name}`,
          );
        }

        return {
          contentBlockingKeysGetter: contentBlockingKeysGetterResult.data,
          contentSummaryGetter: contentSummaryGetterResult.data,
        };
      },
      { concurrency: 1 },
    );

    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: makeSuccessfulResult(null),
      artifacts: { collections: collectionArtifacts },
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

Collections in the same batch can reference each other using
ProtoCollection_<index> as the collectionId in DocumentRef properties, where
<index> is the 0-based position of the referenced collection in the collections
array.
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
                exampleDocument: {
                  description: `
An example document in the collection. Make it as simple as possible. Must be
valid. Valid DocumentRef = { collectionId: "ProtoCollection_<index>", documentId: "Document_example" }.
                  `.trim(),
                  type: "object",
                  additionalProperties: true,
                },
              },
              required: ["settings", "schema", "exampleDocument"],
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
