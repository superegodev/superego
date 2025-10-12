import type { ToolCall, ToolResult } from "@superego/backend";
import { makeUnsuccessfulResult } from "@superego/shared-utils";
import makeResultError from "../../../makers/makeResultError.js";

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
