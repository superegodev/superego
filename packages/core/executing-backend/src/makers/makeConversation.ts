import type { Conversation } from "@superego/backend";
import type ConversationEntity from "../entities/ConversationEntity.js";

export default function makeConversation(
  { contextFingerprint, ...conversation }: ConversationEntity,
  currentContextFingerprint: string,
): Conversation {
  return {
    ...conversation,
    hasOutdatedContext: contextFingerprint !== currentContextFingerprint,
  };
}
