import type { Collection, ToolCall, ToolResult } from "@superego/backend";
import { codegen } from "@superego/schema";
import makeSuccessfulToolResultOutput from "../../../makers/makeSuccessfulToolResultOutput.js";
import makeToolResultError from "../../../makers/makeToolResultError.js";
import makeUnsuccessfulToolResultOutput from "../../../makers/makeUnsuccessfulToolResultOutput.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.GetCollectionTypescriptSchema {
    return toolCall.tool === "get_collection_typescript_schema";
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
        ? makeSuccessfulToolResultOutput({
            typescriptSchema: codegen(collection.latestVersion.schema),
          })
        : makeUnsuccessfulToolResultOutput(
            makeToolResultError("CollectionNotFound", { collectionId }),
          ),
    };
  },
};
