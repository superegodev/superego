import {
  type Collection,
  type ToolCall,
  ToolName,
  type ToolResult,
} from "@superego/backend";
import { codegen } from "@superego/schema";
import {
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import makeResultError from "../../../makers/makeResultError.js";
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

    if (!collection) {
      return {
        tool: toolCall.tool,
        toolCallId: toolCall.id,
        output: makeUnsuccessfulResult(
          makeResultError("CollectionNotFound", { collectionId }),
        ),
      };
    }

    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: makeSuccessfulResult({
        typescriptSchema: codegen(collection.latestVersion.schema),
      }),
    };
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
