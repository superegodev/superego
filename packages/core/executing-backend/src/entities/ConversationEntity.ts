import type {
  Assistant,
  ConversationFormat,
  ConversationId,
  ConversationStatus,
  Message,
} from "@superego/backend";

export default interface ConversationEntity {
  id: ConversationId;
  assistant: Assistant;
  format: ConversationFormat;
  title: string;
  status: ConversationStatus;
  messages: Message[];
  conversationContextFingerprint: string;
  createdAt: Date;
}
