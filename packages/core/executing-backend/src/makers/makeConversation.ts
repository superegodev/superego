import { type Conversation, ConversationStatus } from "@superego/backend";
import type ConversationEntity from "../entities/ConversationEntity.js";
import ConversationUtils from "../utils/ConversationUtils.js";

export default function makeConversation(
  conversation: ConversationEntity,
  currentContextFingerprint: string,
): Conversation {
  const { contextFingerprint, ...rest } = conversation;
  const hasOutdatedContext = contextFingerprint !== currentContextFingerprint;
  return {
    ...rest,
    hasOutdatedContext: hasOutdatedContext,
    canRetryLastResponse:
      rest.status === ConversationStatus.Idle &&
      !hasOutdatedContext &&
      !ConversationUtils.lastResponseHadSideEffects(rest.messages),
  };
}
