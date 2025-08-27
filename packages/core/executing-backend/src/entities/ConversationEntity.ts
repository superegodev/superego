import type {
  AssistantName,
  ConversationFormat,
  ConversationId,
  Message,
} from "@superego/backend";

export default interface ConversationEntity {
  id: ConversationId;
  assistant: AssistantName;
  format: ConversationFormat;
  title: string;
  contextFingerprint: string;
  messages: Message[];
  isCompleted: boolean;
  createdAt: Date;
}
