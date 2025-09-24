import { type Conversation, ConversationStatus } from "@superego/backend";
import type ConversationEntity from "../entities/ConversationEntity.js";
import ConversationUtils from "../utils/ConversationUtils.js";

export default function makeConversation(
  { contextFingerprint, ...conversation }: ConversationEntity,
  currentContextFingerprint: string,
): Conversation {
  const hasOutdatedContext = contextFingerprint !== currentContextFingerprint;
  return {
    ...conversation,
    hasOutdatedContext: hasOutdatedContext,
    canRetryLastResponse:
      conversation.status === ConversationStatus.Idle &&
      !hasOutdatedContext &&
      !ConversationUtils.lastResponseHadSideEffects(conversation.messages),
  };
}
