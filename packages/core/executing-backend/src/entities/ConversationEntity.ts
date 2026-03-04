import type {
  AssistantName,
  ConversationId,
  ConversationStatus,
  Message,
} from "@superego/backend";

type ConversationEntity = {
  id: ConversationId;
  assistant: AssistantName;
  title: string | null;
  contextFingerprint: string;
  messages: Message[];
  status: ConversationStatus;
  error: { name: string; details: any } | null;
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
