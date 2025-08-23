import type { Conversation } from "@superego/backend";
import type ConversationEntity from "../entities/ConversationEntity.js";

export default function makeConversation(
  conversation: ConversationEntity,
): Conversation {
  return {
    id: conversation.id,
    type: conversation.type,
    title: conversation.title,
    messages: conversation.messages,
    isGeneratingNextMessage: conversation.isGeneratingNextMessage,
    nextMessageGenerationError: conversation.nextMessageGenerationError,
    createdAt: conversation.createdAt,
  };
}
