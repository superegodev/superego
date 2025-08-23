import type {
  ConversationId,
  ConversationType,
  Message,
} from "@superego/backend";

export default interface ConversationEntity {
  id: ConversationId;
  type: ConversationType;
  title: string | null;
  messages: Message[];
  isGeneratingNextMessage: boolean;
  nextMessageGenerationError: string | null;
  createdAt: Date;
}
