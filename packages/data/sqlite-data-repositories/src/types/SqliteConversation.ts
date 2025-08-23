import type { ConversationId, ConversationType } from "@superego/backend";
import type { ConversationEntity } from "@superego/executing-backend";

export default interface SqliteConversation {
  id: ConversationId;
  type: ConversationType;
  title: string | null;
  /** JSON */
  messages: string;
  is_generating_next_message: 0 | 1;
  next_message_generation_error: string | null;
  /** ISO8601 */
  created_at: string;
}

export function toEntity(conversation: SqliteConversation): ConversationEntity {
  return {
    id: conversation.id,
    type: conversation.type,
    title: conversation.title,
    messages: JSON.parse(conversation.messages),
    isGeneratingNextMessage: Boolean(conversation.is_generating_next_message),
    nextMessageGenerationError: conversation.next_message_generation_error,
    createdAt: new Date(conversation.created_at),
  };
}
