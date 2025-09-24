import { decode } from "@msgpack/msgpack";
import type {
  AssistantName,
  ConversationFormat,
  ConversationId,
  ConversationStatus,
  Message,
} from "@superego/backend";
import type { ConversationEntity } from "@superego/executing-backend";

export default interface SqliteConversation {
  id: ConversationId;
  assistant: AssistantName;
  format: ConversationFormat;
  title: string | null;
  context_fingerprint: string;
  /** MessagePack */
  messages: Buffer;
  status: ConversationStatus;
  /** JSON */
  error: string | null;
  /** ISO8601 */
  created_at: string;
}

export function toEntity(conversation: SqliteConversation): ConversationEntity {
  return {
    id: conversation.id,
    assistant: conversation.assistant,
    format: conversation.format,
    title: conversation.title,
    contextFingerprint: conversation.context_fingerprint,
    messages: decode(conversation.messages) as Message[],
    status: conversation.status,
    error: conversation.error ? JSON.parse(conversation.error) : null,
    createdAt: new Date(conversation.created_at),
  };
}
