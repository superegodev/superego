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
import type CollectionsCreate from "../../../usecases/collections/Create.js";
import isEmpty from "../../../utils/isEmpty.js";
import validateTableColumns from "../utils/validateTableColumns.js";

const stubContentSummaryGetter = {
  source: "export default function stub() { return {}; }",
  compiled: "export default function stub() { return {}; }",
};

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.SuggestCollectionDefinition {
    return toolCall.tool === ToolName.SuggestCollectionDefinition;
  },

  async exec(
    toolCall: ToolCall.SuggestCollectionDefinition,
    collectionsCreate: CollectionsCreate,
  ): Promise<ToolResult.SuggestCollectionDefinition> {
    const { settings, schema, tableColumns, exampleDocument } = toolCall.input;

    const createResult = await collectionsCreate.exec(
      {
        ...settings,
        defaultCollectionViewAppId: null,
        assistantInstructions: null,
      },
      schema,
      { contentSummaryGetter: stubContentSummaryGetter },
      // Dry run
      true,
    );

    if (
      createResult.error &&
      (createResult.error.name === "UnexpectedError" ||
        createResult.error.name === "CollectionCategoryNotFound" ||
        createResult.error.name === "AppNotFound" ||
        createResult.error.name === "ContentSummaryGetterNotValid")
    ) {
      throw new UnexpectedAssistantError(
        [
          `Dry-run creating collection failed with ${createResult.error.name}.`,
          createResult.error.name === "UnexpectedError"
            ? ` Cause: ${createResult.error.details.cause}`
            : "",
        ].join(""),
      );
    }
    if (createResult.error) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: makeUnsuccessfulResult(createResult.error),
      };
    }

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

    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: makeSuccessfulResult(null),
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.SuggestCollectionDefinition,
      description: `
Suggests the user a collection definition. This is ONLY suggestion. The user
will review it and decide whether to create it or not. This tool DOES NOT create
the collection.
      `.trim(),
      inputSchema: {
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
                  "The id of the collection category under which the collection should go. Null if there's no suitable collection category.",
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
can be selected; Files, JsonObjects, Lists, and Structs are **NOT ALLOWED**.
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
            description:
              "An example document in the collection. Make it as simple as possible. Used to show a UI preview.",
            type: "object",
            additionalProperties: true,
          },
        },
        required: ["settings", "schema", "tableColumns", "exampleDocument"],
        additionalProperties: false,
      },
    };
  },
};
