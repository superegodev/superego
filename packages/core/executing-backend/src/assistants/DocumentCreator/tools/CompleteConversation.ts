import type { ToolCall, ToolResult } from "@superego/backend";
import makeToolResultError from "../../../makers/makeToolResultError.js";
import makeUnsuccessfulToolResultOutput from "../../../makers/makeUnsuccessfulToolResultOutput.js";
import InferenceService from "../../../requirements/InferenceService.js";

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

  get(): InferenceService.Tool {
    return {
      type: InferenceService.ToolType.Function,
      name: "complete_conversation",
      description: "Marks the conversation with the user as completed.",
      inputSchema: {
        type: "object",
        properties: {
          finalMessage: {
            type: "string",
            description:
              "The final message to the user, where the assistant summarizes what it did",
          },
        },
        required: ["finalMessage"],
        additionalProperties: false,
      },
    };
  },
};
