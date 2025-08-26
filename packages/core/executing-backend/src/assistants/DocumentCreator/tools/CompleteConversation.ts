import type { ToolCall, ToolResult } from "@superego/backend";
import makeToolResultError from "../../../makers/makeToolResultError.js";
import makeUnsuccessfulToolResultOutput from "../../../makers/makeUnsuccessfulToolResultOutput.js";

export default {
  is(toolCall: ToolCall): toolCall is ToolCall.CompleteConversation {
    return toolCall.tool === "complete_conversation";
  },

  // This function will only be invoked only if the
  // ToolCall.CompleteConversation was part of a Message.ToolAssistant with
  // multiple toolCalls.
  async exec(toolCall: ToolCall.CompleteConversation): Promise<ToolResult> {
    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: makeUnsuccessfulToolResultOutput(
        makeToolResultError(
          "InvalidToolCall",
          "The complete_conversation tool cannot be called in parallel with other tools.",
        ),
      ),
    };
  },
};
