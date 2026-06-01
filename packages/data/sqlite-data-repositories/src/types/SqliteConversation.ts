import type {
  AssistantName,
  ConversationId,
  ConversationNodeId,
} from "@superego/backend";

type SqliteConversation = {
  id: ConversationId;
  assistant: AssistantName;
  context_fingerprint: string;
  /** ISO 8601 */
  created_at: string;
};
export default SqliteConversation;

export type SqliteConversationEvent = {
  conversation_id: ConversationId;
  position: number;
  type: string;
  /** MessagePack */
  payload: Buffer;
  /** ISO 8601 */
  created_at: string;
};

export function makeConversationNodeId(
  conversationId: ConversationId,
  position: number,
): ConversationNodeId {
  return `${conversationId}:${position}`;
}
