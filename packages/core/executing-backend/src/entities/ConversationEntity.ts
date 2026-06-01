import type {
  AssistantName,
  ConversationId,
  ConversationNode,
  ConversationNodeId,
  ConversationStatus,
} from "@superego/backend";

type ConversationEntity = {
  id: ConversationId;
  assistant: AssistantName;
  title: string | null;
  contextFingerprint: string;
  nodes: ConversationNode[];
  activeNodeId: ConversationNodeId | null;
  status: ConversationStatus;
  processingStartedAt: Date | null;
  error: { name: string; details: any } | null;
  createdAt: Date;
} & (
  | {
      status: ConversationStatus.Idle;
      processingStartedAt: null;
      error: null;
    }
  | {
      status: ConversationStatus.Processing;
      processingStartedAt: Date;
      error: null;
    }
  | {
      status: ConversationStatus.Error;
      processingStartedAt: null;
      error: { name: string; details: any };
    }
);
export default ConversationEntity;
