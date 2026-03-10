import { decode } from "@msgpack/msgpack";
import type {
  AssistantName,
  ConversationId,
  ConversationStatus,
  Message,
} from "@superego/backend";
import type { ConversationEntity } from "@superego/executing-backend";

type SqliteConversation = {
  id: ConversationId;
  assistant: AssistantName;
  title: string | null;
  context_fingerprint: string;
  /** MessagePack */
  messages: Buffer;
  status: ConversationStatus;
  /** ISO 8601 */
  processing_started_at: string | null;
  /** JSON */
  error: string | null;
  /** ISO 8601 */
  created_at: string;
};
export default SqliteConversation;

export function toEntity(conversation: SqliteConversation): ConversationEntity {
  return {
    id: conversation.id,
    assistant: conversation.assistant,
    title: conversation.title,
    contextFingerprint: conversation.context_fingerprint,
    messages: decode(conversation.messages) as Message[],
    status: conversation.status,
    processingStartedAt: conversation.processing_started_at
      ? new Date(conversation.processing_started_at)
      : null,
    error: conversation.error ? JSON.parse(conversation.error) : null,
    createdAt: new Date(conversation.created_at),
  } as ConversationEntity;
}
