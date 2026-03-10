import { type Conversation, MessageRole } from "@superego/backend";

export default function getReasoningTrace(
  conversation: Conversation,
): string | null {
  for (let i = conversation.messages.length - 1; i >= 0; i--) {
    const message = conversation.messages[i]!;
    if (message.role === MessageRole.User) {
      return null;
    }
    if (
      message.role === MessageRole.Assistant &&
      (message.reasoning.content || message.reasoning.summary)
    ) {
      return message.reasoning.content || message.reasoning.summary || null;
    }
  }
  return null;
}
