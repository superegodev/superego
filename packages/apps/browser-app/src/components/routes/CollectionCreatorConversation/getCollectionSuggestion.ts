import {
  type Conversation,
  MessageRole,
  type ToolCall,
  ToolName,
  type ToolResult,
} from "@superego/backend";

export default function getCollectionSuggestion(
  conversation: Conversation,
): ToolCall.SuggestCollectionDefinition["input"] | null {
  const reversedMessages = conversation.messages.toReversed();

  let lastSuccessfulResult: ToolResult.SuggestCollectionDefinition | null =
    null;
  let lastSuccessfulCall: ToolCall.SuggestCollectionDefinition | null = null;
  for (const message of reversedMessages) {
    if (message.role === MessageRole.Tool) {
      lastSuccessfulResult = (message.toolResults.find(
        (toolResult) =>
          toolResult.tool === ToolName.SuggestCollectionDefinition &&
          toolResult.output.success,
      ) ?? null) as ToolResult.SuggestCollectionDefinition | null;
    }
    if (
      lastSuccessfulResult !== null &&
      message.role === MessageRole.Assistant &&
      "toolCalls" in message
    ) {
      const { toolCallId } = lastSuccessfulResult;
      lastSuccessfulCall = (message.toolCalls.find(
        (toolCall) => toolCall.id === toolCallId,
      ) ?? null) as ToolCall.SuggestCollectionDefinition | null;
      if (lastSuccessfulCall) {
        break;
      }
    }
  }

  return lastSuccessfulCall?.input ?? null;
}
