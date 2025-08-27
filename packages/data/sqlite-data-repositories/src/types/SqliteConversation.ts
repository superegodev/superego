import type {
  AssistantName,
  ConversationFormat,
  ConversationId,
} from "@superego/backend";
import type { ConversationEntity } from "@superego/executing-backend";

export default interface SqliteConversation {
  id: ConversationId;
  assistant: AssistantName;
  format: ConversationFormat;
  title: string;
  context_fingerprint: string;
  /** JSON */
  messages: string;
  is_completed: 0 | 1;
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
    messages: JSON.parse(conversation.messages),
    isCompleted: Boolean(conversation.is_completed),
    createdAt: new Date(conversation.created_at),
  };
}
