import { type Message, MessageRole } from "@superego/backend";
import type AggregatedGenerationStats from "./AggregatedGenerationStats.js";

export default function aggregateGenerationStats(
  messages: Message[],
  targetMessage: Message.ContentAssistant,
): AggregatedGenerationStats {
  const targetIndex = messages.findIndex(
    (message) => "id" in message && message.id === targetMessage.id,
  );

  let inputTokens = 0;
  let outputTokens = 0;
  let totalTokens = 0;
  let timeTaken = 0;
  let cost: number | undefined;
  let toolCallCount = 0;
  for (let index = targetIndex; index >= 0; index--) {
    const message = messages[index]!;
    if (message.role === MessageRole.User) {
      break;
    }
    if (message.role === MessageRole.Assistant) {
      inputTokens += message.generationStats.inputTokens;
      outputTokens += message.generationStats.outputTokens;
      totalTokens += message.generationStats.totalTokens;
      timeTaken += message.generationStats.timeTaken;
      if (message.generationStats.cost != null) {
        cost = (cost ?? 0) + message.generationStats.cost;
      }
      if ("toolCalls" in message) {
        toolCallCount += message.toolCalls.length;
      }
    }
  }

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    timeTaken,
    cost,
    toolCallCount,
  };
}
