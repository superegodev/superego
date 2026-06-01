import type {
  AssistantName,
  ConversationId,
  ConversationNodeId,
  Message,
} from "@superego/backend";
import type ConversationEntity from "../entities/ConversationEntity.js";

export default interface ConversationRepository {
  create(conversation: {
    id: ConversationId;
    assistant: AssistantName;
    contextFingerprint: string;
    createdAt: Date;
  }): Promise<void>;
  appendMessage(
    conversationId: ConversationId,
    previousNodeId: ConversationNodeId | null,
    message: Message,
  ): Promise<ConversationNodeId>;
  updateMessage(
    conversationId: ConversationId,
    nodeId: ConversationNodeId,
    message: Message,
  ): Promise<void>;
  setTitle(conversationId: ConversationId, title: string): Promise<void>;
  markProcessingStarted(
    conversationId: ConversationId,
    previousNodeId: ConversationNodeId | null,
    startedAt: Date,
  ): Promise<void>;
  markProcessingCompleted(conversationId: ConversationId): Promise<void>;
  markProcessingFailed(
    conversationId: ConversationId,
    previousNodeId: ConversationNodeId | null,
    error: { name: string; details: any },
  ): Promise<ConversationNodeId>;
  delete(id: ConversationId): Promise<ConversationId>;
  exists(id: ConversationId): Promise<boolean>;
  find(id: ConversationId): Promise<ConversationEntity | null>;
  findAll(): Promise<ConversationEntity[]>;
}
