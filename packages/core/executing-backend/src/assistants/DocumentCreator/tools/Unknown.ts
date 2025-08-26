import type { ToolCall, ToolResult } from "@superego/backend";
import makeToolResultError from "../../../makers/makeToolResultError.js";
import makeUnsuccessfulToolResultOutput from "../../../makers/makeUnsuccessfulToolResultOutput.js";

export default {
  // This function will only be invoked only for unknown tool calls.
  async exec(toolCall: ToolCall): Promise<ToolResult> {
    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: makeUnsuccessfulToolResultOutput(
        makeToolResultError("ToolNotFound"),
      ),
    };
  },
};
