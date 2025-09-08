import { MessageContentPartType, MessageRole } from "@superego/backend";
import { InferenceService } from "@superego/executing-backend";

const toolName = "giveAnswer";

export default class BooleanOracle {
  constructor(private inferenceService: InferenceService) {}

  async ask(question: string): Promise<{ answer: boolean; reason: string }> {
    const message = await this.inferenceService.generateNextMessage(
      [
        {
          role: MessageRole.Developer,
          content: [
            {
              type: MessageContentPartType.Text,
              text: [
                "You are a boolean oracle. Your job is to give a true/false",
                "answer to a user question, and provide a reason for which you",
                "gave that answer. You give the answer by calling the",
                `\`${toolName}\` tool.`,
              ].join(" "),
            },
          ],
        },
        {
          role: MessageRole.User,
          content: [{ type: MessageContentPartType.Text, text: question }],
          createdAt: new Date(),
        },
      ],
      [
        {
          type: InferenceService.ToolType.Function,
          name: toolName,
          description: "giveAnswer",
          inputSchema: {
            type: "object",
            properties: {
              answer: { type: "boolean" },
              reason: { type: "string" },
            },
            required: ["answer", "reason"],
            additionalProperties: false,
          },
        },
      ],
    );
    const toolCall =
      "toolCalls" in message &&
      message.toolCalls.find(({ tool }) => tool === toolName);
    const isValidToolCall =
      !!toolCall &&
      "answer" in toolCall.input &&
      typeof toolCall.input.answer === "boolean" &&
      "reason" in toolCall.input &&
      typeof toolCall.input.reason === "string";
    return isValidToolCall
      ? {
          answer: toolCall.input.answer,
          reason: toolCall.input.reason,
        }
      : {
          answer: false,
          reason: "BooleanOracle failed to generate an answer.",
        };
  }
}
