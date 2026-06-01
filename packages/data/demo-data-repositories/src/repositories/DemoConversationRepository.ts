import {
  ConversationStatus,
  type ConversationId,
  type ConversationNodeId,
  type Message,
} from "@superego/backend";
import type {
  ConversationEntity,
  ConversationRepository,
} from "@superego/executing-backend";
import type Data from "../Data.js";
import clone from "../utils/clone.js";
import Disposable from "../utils/Disposable.js";

export default class DemoConversationRepository
  extends Disposable
  implements ConversationRepository
{
  constructor(
    private conversations: Data["conversations"],
    private onWrite: () => void,
  ) {
    super();
  }

  async create(
    conversation: Pick<
      ConversationEntity,
      "id" | "assistant" | "contextFingerprint" | "createdAt"
    >,
  ): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    this.conversations[conversation.id] = {
      ...clone(conversation),
      title: null,
      nodes: [],
      activeNodeId: null,
      status: ConversationStatus.Idle,
      processingStartedAt: null,
      error: null,
    };
  }

  async appendMessage(
    conversationId: ConversationId,
    previousNodeId: ConversationNodeId | null,
    message: Message,
  ): Promise<ConversationNodeId> {
    this.ensureNotDisposed();
    this.onWrite();
    const conversation = this.conversations[conversationId]!;
    const nodeId = this.makeNodeId(conversationId);
    conversation.nodes.push({
      type: "Message",
      id: nodeId,
      previousNodeId,
      message: clone(message),
      createdAt: new Date(),
    });
    conversation.activeNodeId = nodeId;
    return nodeId;
  }

  async updateMessage(
    conversationId: ConversationId,
    nodeId: ConversationNodeId,
    message: Message,
  ): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    const conversation = this.conversations[conversationId]!;
    const node = conversation.nodes.find((node) => node.id === nodeId);
    if (node?.type === "Message") {
      node.message = clone(message);
    }
  }

  async setTitle(conversationId: ConversationId, title: string): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    this.conversations[conversationId]!.title = title;
  }

  async markProcessingStarted(
    conversationId: ConversationId,
    previousNodeId: ConversationNodeId | null,
    startedAt: Date,
  ): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    const conversation = this.conversations[conversationId]!;
    conversation.activeNodeId = previousNodeId;
    conversation.status = ConversationStatus.Processing;
    conversation.processingStartedAt = startedAt;
    conversation.error = null;
  }

  async markProcessingCompleted(conversationId: ConversationId): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    const conversation = this.conversations[conversationId]!;
    conversation.status = ConversationStatus.Idle;
    conversation.processingStartedAt = null;
    conversation.error = null;
  }

  async markProcessingFailed(
    conversationId: ConversationId,
    previousNodeId: ConversationNodeId | null,
    error: { name: string; details: any },
  ): Promise<ConversationNodeId> {
    this.ensureNotDisposed();
    this.onWrite();
    const conversation = this.conversations[conversationId]!;
    const nodeId = this.makeNodeId(conversationId);
    conversation.nodes.push({
      type: "Error",
      id: nodeId,
      previousNodeId,
      error,
      createdAt: new Date(),
    });
    conversation.activeNodeId = nodeId;
    conversation.status = ConversationStatus.Error;
    conversation.processingStartedAt = null;
    conversation.error = error;
    return nodeId;
  }

  async delete(id: ConversationId): Promise<ConversationId> {
    this.ensureNotDisposed();
    this.onWrite();
    delete this.conversations[id];
    return id;
  }

  async exists(id: ConversationId): Promise<boolean> {
    this.ensureNotDisposed();
    return this.conversations[id] !== undefined;
  }

  async find(id: ConversationId): Promise<ConversationEntity | null> {
    this.ensureNotDisposed();
    return clone(this.conversations[id] ?? null);
  }

  async findAll(): Promise<ConversationEntity[]> {
    this.ensureNotDisposed();
    return clone(
      Object.values(this.conversations).sort((a, b) =>
        a.createdAt <= b.createdAt ? 1 : -1,
      ),
    );
  }

  private makeNodeId(conversationId: ConversationId): ConversationNodeId {
    return `${conversationId}:${
      (this.conversations[conversationId]?.nodes.length ?? 0) + 1
    }` as ConversationNodeId;
  }
}
