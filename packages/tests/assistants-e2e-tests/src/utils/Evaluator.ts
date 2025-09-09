import { MessageContentPartType, MessageRole } from "@superego/backend";
import { InferenceService } from "@superego/executing-backend";

const toolName = "giveScore";

export default class Evaluator {
  constructor(private inferenceService: InferenceService) {}

  async score(
    instructions: string,
  ): Promise<{ score: number; reason: string }> {
    const message = await this.inferenceService.generateNextMessage(
      [
        {
          role: MessageRole.User,
          content: [{ type: MessageContentPartType.Text, text: instructions }],
          createdAt: new Date(),
        },
      ],
      [
        {
          type: InferenceService.ToolType.Function,
          name: toolName,
          description: "Gives a score",
          inputSchema: {
            type: "object",
            properties: {
              score: {
                description: "The given score",
                type: "number",
                minimum: 0,
                maximum: 1,
              },
              reason: {
                description: "A concise reason for which the score was given",
                type: "string",
              },
            },
            required: ["score", "reason"],
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
      "score" in toolCall.input &&
      typeof toolCall.input.score === "number" &&
      toolCall.input.score >= 0 &&
      toolCall.input.score <= 1 &&
      "reason" in toolCall.input &&
      typeof toolCall.input.reason === "string";
    return isValidToolCall
      ? { score: toolCall.input.score, reason: toolCall.input.reason }
      : { score: 0, reason: "Evaluator failed to produce a score." };
  }
}
