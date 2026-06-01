import { type Conversation, MessageRole } from "@superego/backend";
import ConversationUtils from "../../../../utils/ConversationUtils.js";

export default function getReasoningTrace(
  conversation: Conversation,
): string | null {
  const messages = ConversationUtils.getActiveBranchMessages(conversation);
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i]!;
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
