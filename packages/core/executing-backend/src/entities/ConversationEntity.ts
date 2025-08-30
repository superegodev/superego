import type {
  ConversationFormat,
  ConversationId,
  ConversationStatus,
  Message,
} from "@superego/backend";

type ConversationEntity = {
  id: ConversationId;
  format: ConversationFormat;
  title: string;
  contextFingerprint: string;
  messages: Message[];
  createdAt: Date;
} & (
  | {
      status: ConversationStatus.Idle | ConversationStatus.Processing;
      error: null;
    }
  | {
      status: ConversationStatus.Error;
      error: { name: string; details: any };
    }
);
export default ConversationEntity;
