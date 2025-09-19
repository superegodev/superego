import type { ToolCall, ToolResult } from "@superego/backend";
import makeResultError from "../../../makers/makeResultError.js";
import makeUnsuccessfulResult from "../../../makers/makeUnsuccessfulResult.js";

export default {
  // This function will only be invoked only for unknown tool calls.
  async exec(toolCall: ToolCall): Promise<ToolResult.Unknown> {
    return {
      tool: toolCall.tool,
      toolCallId: toolCall.id,
      output: makeUnsuccessfulResult(makeResultError("ToolNotFound", null)),
    };
  },
};
