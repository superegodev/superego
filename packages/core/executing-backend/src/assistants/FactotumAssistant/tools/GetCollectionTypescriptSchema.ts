import { type ToolCall, ToolName, type ToolResult } from "@superego/backend";
import UnexpectedAssistantError from "../../../errors/UnexpectedAssistantError.js";
import InferenceService from "../../../requirements/InferenceService.js";
import type CollectionsGetTypescriptSchema from "../../../usecases/collections/GetTypescriptSchema.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.GetCollectionTypescriptSchema {
    return toolCall.tool === ToolName.GetCollectionTypescriptSchema;
  },

  async exec(
    toolCall: ToolCall.GetCollectionTypescriptSchema,
    collectionsGetTypescriptSchema: CollectionsGetTypescriptSchema,
  ): Promise<ToolResult.GetCollectionTypescriptSchema> {
    const output = await collectionsGetTypescriptSchema.exec(
      toolCall.input.collectionId,
    );
    if (output.success) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output,
      };
    }
    if (output.error.name === "CollectionNotFound") {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: {
          success: false,
          data: null,
          error: output.error,
        },
      };
    }
    throw new UnexpectedAssistantError(
      `Getting collection TypeScript schema failed with ${output.error.name}. Cause: ${output.error.details.cause}`,
    );
  },

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: ToolName.GetCollectionTypescriptSchema,
      description: `
Fetches the TypeScript type declarations for a collection.

**Use it:**

- As the **source of truth** for fields, types, enums, constraints.
- **All fields are required.** If a field's type includes \`null\`, the key
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
