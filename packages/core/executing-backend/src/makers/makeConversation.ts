import type { Conversation } from "@superego/backend";
import type ConversationEntity from "../entities/ConversationEntity.js";

export default function makeConversation(
  conversation: ConversationEntity,
): Conversation {
  return {
    id: conversation.id,
    assistant: conversation.assistant,
    format: conversation.format,
    title: conversation.title,
    contextFingerprint: conversation.contextFingerprint,
    messages: conversation.messages,
    isCompleted: conversation.isCompleted,
    createdAt: conversation.createdAt,
  };
}
