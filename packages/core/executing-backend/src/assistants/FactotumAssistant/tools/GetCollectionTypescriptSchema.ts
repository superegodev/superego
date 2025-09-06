import {
  type Collection,
  type ToolCall,
  ToolName,
  type ToolResult,
} from "@superego/backend";
import { codegen } from "@superego/schema";
import makeResultError from "../../../makers/makeResultError.js";
import makeSuccessfulResult from "../../../makers/makeSuccessfulResult.js";
import makeUnsuccessfulResult from "../../../makers/makeUnsuccessfulResult.js";
import InferenceService from "../../../requirements/InferenceService.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.GetCollectionTypescriptSchema {
    return toolCall.tool === ToolName.GetCollectionTypescriptSchema;
  },

  async exec(
    toolCall: ToolCall.GetCollectionTypescriptSchema,
    collections: Collection[],
  ): Promise<ToolResult.GetCollectionTypescriptSchema> {
    const { collectionId } = toolCall.input;
    const collection = collections.find(({ id }) => id === collectionId);
    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: collection
        ? makeSuccessfulResult({
            typescriptSchema: makeTypescriptSchema(collection),
          })
        : makeUnsuccessfulResult(
            makeResultError("CollectionNotFound", { collectionId }),
          ),
    };
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.GetCollectionTypescriptSchema,
      description: `
Fetch the TypeScript type declarations for a collection.

**Use it:**

- As the **source of truth** for fields, types, enums, constraints.
- **All fields are required.** If a field’s type includes \`null\`, the key
  **must** be present and may be \`null\`; otherwise it must be a non-null
  value.
      `.trim(),
      inputSchema: {
        type: "object",
        properties: {
          collectionId: {
            type: "string",
          },
        },
        required: ["collectionId"],
        additionalProperties: false,
      },
    };
  },
};

function makeTypescriptSchema(collection: Collection): string {
  const { schema } = collection.latestVersion;
  return [
    codegen(schema),
    "////////////////////////////////",
    "// Collection document schema //",
    "////////////////////////////////",
    "",
    `/** This is the schema for a document in ${collection.id}. */`,
    `interface ${collection.id}_Document {`,
    // biome-ignore lint/suspicious/noTemplateCurlyInString: intended usage.
    "  id: `Document_${string}`;",
    // biome-ignore lint/suspicious/noTemplateCurlyInString: intended usage.
    "  versionId: `DocumentVersion_${string}`;",
    `  content: ${schema.rootType};`,
    "}",
    "",
  ].join("\n");
}
