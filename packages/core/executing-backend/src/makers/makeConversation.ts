import type { Conversation } from "@superego/backend";
import type ConversationEntity from "../entities/ConversationEntity.js";

export default function makeConversation(
  conversation: ConversationEntity,
): Conversation {
  return { ...conversation };
}
