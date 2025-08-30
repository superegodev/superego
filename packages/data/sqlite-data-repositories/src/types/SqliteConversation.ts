import type {
  ConversationFormat,
  ConversationId,
  ConversationStatus,
} from "@superego/backend";
import type { ConversationEntity } from "@superego/executing-backend";

export default interface SqliteConversation {
  id: ConversationId;
  format: ConversationFormat;
  title: string;
  context_fingerprint: string;
  /** JSON */
  messages: string;
  status: ConversationStatus;
  /** JSON */
  error: string | null;
  /** ISO8601 */
  created_at: string;
}

export function toEntity(conversation: SqliteConversation): ConversationEntity {
  return {
    id: conversation.id,
    format: conversation.format,
    title: conversation.title,
    contextFingerprint: conversation.context_fingerprint,
    messages: JSON.parse(conversation.messages),
    status: conversation.status,
    error: conversation.error ? JSON.parse(conversation.error) : null,
    createdAt: new Date(conversation.created_at),
  };
}
