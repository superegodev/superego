import { type Conversation, ConversationStatus } from "@superego/backend";
import type ConversationEntity from "../entities/ConversationEntity.js";
import ConversationUtils from "../utils/ConversationUtils.js";

export default function makeConversation(
  conversation: ConversationEntity,
  currentContextFingerprint: string,
): Conversation {
  const { contextFingerprint, ...rest } = conversation;
  const hasOutdatedContext = contextFingerprint !== currentContextFingerprint;
  const activeBranchMessages = ConversationUtils.getActiveBranchMessages(
    rest.nodes,
    rest.activeNodeId,
  );
  return {
    ...rest,
    hasOutdatedContext: hasOutdatedContext,
    canRetryLastResponse:
      rest.status === ConversationStatus.Idle &&
      !hasOutdatedContext &&
      !ConversationUtils.lastResponseHadSideEffects(activeBranchMessages),
  };
}
