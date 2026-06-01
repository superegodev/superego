import type { DatabaseSync } from "node:sqlite";
import { decode, encode } from "@msgpack/msgpack";
import {
  ConversationStatus,
  type ConversationId,
  type ConversationNode,
  type ConversationNodeId,
  type Message,
} from "@superego/backend";
import type {
  ConversationEntity,
  ConversationRepository,
} from "@superego/executing-backend";
import type SqliteConversation from "../types/SqliteConversation.js";
import type { SqliteConversationEvent } from "../types/SqliteConversation.js";
import { makeConversationNodeId } from "../types/SqliteConversation.js";

const conversationsTable = "conversations";
const conversationEventsTable = "conversation_events";

enum ConversationEventType {
  MessageAdded = "MessageAdded",
  MessageUpdated = "MessageUpdated",
  TitleSet = "TitleSet",
  ProcessingStarted = "ProcessingStarted",
  ProcessingCompleted = "ProcessingCompleted",
  ProcessingFailed = "ProcessingFailed",
  ConversationDeleted = "ConversationDeleted",
}

type MessageAddedPayload = {
  previousNodeId: ConversationNodeId | null;
  message: Message;
};
type MessageUpdatedPayload = {
  nodeId: ConversationNodeId;
  message: Message;
};
type TitleSetPayload = { title: string };
type ProcessingStartedPayload = {
  previousNodeId: ConversationNodeId | null;
  processingStartedAt: Date;
};
type ProcessingFailedPayload = {
  previousNodeId: ConversationNodeId | null;
  error: { name: string; details: any };
};

export default class SqliteConversationRepository implements ConversationRepository {
  constructor(private db: DatabaseSync) {}

  async create(
    conversation: Pick<
      ConversationEntity,
      "id" | "assistant" | "contextFingerprint" | "createdAt"
    >,
  ): Promise<void> {
    this.db
      .prepare(`
        INSERT INTO "${conversationsTable}"
          ("id", "assistant", "context_fingerprint", "created_at")
        VALUES
          (?, ?, ?, ?)
      `)
      .run(
        conversation.id,
        conversation.assistant,
        conversation.contextFingerprint,
        conversation.createdAt.toISOString(),
      );
  }

  async appendMessage(
    conversationId: ConversationId,
    previousNodeId: ConversationNodeId | null,
    message: Message,
  ): Promise<ConversationNodeId> {
    const position = this.appendEvent(
      conversationId,
      ConversationEventType.MessageAdded,
      { previousNodeId, message } satisfies MessageAddedPayload,
    );
    return makeConversationNodeId(conversationId, position);
  }

  async updateMessage(
    conversationId: ConversationId,
    nodeId: ConversationNodeId,
    message: Message,
  ): Promise<void> {
    this.appendEvent(conversationId, ConversationEventType.MessageUpdated, {
      nodeId,
      message,
    } satisfies MessageUpdatedPayload);
  }

  async setTitle(conversationId: ConversationId, title: string): Promise<void> {
    this.appendEvent(conversationId, ConversationEventType.TitleSet, {
      title,
    } satisfies TitleSetPayload);
  }

  async markProcessingStarted(
    conversationId: ConversationId,
    previousNodeId: ConversationNodeId | null,
    startedAt: Date,
  ): Promise<void> {
    this.appendEvent(conversationId, ConversationEventType.ProcessingStarted, {
      previousNodeId,
      processingStartedAt: startedAt,
    } satisfies ProcessingStartedPayload);
  }

  async markProcessingCompleted(conversationId: ConversationId): Promise<void> {
    this.appendEvent(
      conversationId,
      ConversationEventType.ProcessingCompleted,
      null,
    );
  }

  async markProcessingFailed(
    conversationId: ConversationId,
    previousNodeId: ConversationNodeId | null,
    error: { name: string; details: any },
  ): Promise<ConversationNodeId> {
    const position = this.appendEvent(
      conversationId,
      ConversationEventType.ProcessingFailed,
      { previousNodeId, error } satisfies ProcessingFailedPayload,
    );
    return makeConversationNodeId(conversationId, position);
  }

  async delete(id: ConversationId): Promise<ConversationId> {
    this.appendEvent(id, ConversationEventType.ConversationDeleted, null);
    return id;
  }

  async exists(id: ConversationId): Promise<boolean> {
    return (await this.find(id)) !== null;
  }

  async find(id: ConversationId): Promise<ConversationEntity | null> {
    const conversation = this.db
      .prepare(`SELECT * FROM "${conversationsTable}" WHERE "id" = ?`)
      .get(id) as SqliteConversation | undefined;
    if (!conversation) {
      return null;
    }
    return this.projectConversation(conversation);
  }

  async findAll(): Promise<ConversationEntity[]> {
    const conversations = this.db
      .prepare(
        `SELECT * FROM "${conversationsTable}" ORDER BY "created_at" DESC`,
      )
      .all() as SqliteConversation[];
    const projectedConversations = conversations.map((conversation) =>
      this.projectConversation(conversation),
    );
    return projectedConversations.filter(
      (conversation) => conversation !== null,
    );
  }

  private appendEvent(
    conversationId: ConversationId,
    type: ConversationEventType,
    payload: unknown,
  ): number {
    const position = this.nextPosition(conversationId);
    this.db
      .prepare(`
        INSERT INTO "${conversationEventsTable}"
          ("conversation_id", "position", "type", "payload", "created_at")
        VALUES
          (?, ?, ?, ?, ?)
      `)
      .run(
        conversationId,
        position,
        type,
        Buffer.from(encode(payload)),
        new Date().toISOString(),
      );
    return position;
  }

  private nextPosition(conversationId: ConversationId): number {
    const result = this.db
      .prepare(`
        SELECT COALESCE(MAX("position"), 0) + 1 AS "position"
        FROM "${conversationEventsTable}"
        WHERE "conversation_id" = ?
      `)
      .get(conversationId) as { position: number };
    return result.position;
  }

  private projectConversation(
    conversation: SqliteConversation,
  ): ConversationEntity | null {
    const events = this.db
      .prepare(`
        SELECT *
        FROM "${conversationEventsTable}"
        WHERE "conversation_id" = ?
        ORDER BY "position" ASC
      `)
      .all(conversation.id) as SqliteConversationEvent[];

    const nodes: ConversationNode[] = [];
    const nodesById = new Map<ConversationNodeId, ConversationNode>();
    let title: string | null = null;
    let activeNodeId: ConversationNodeId | null = null;
    let status = ConversationStatus.Idle;
    let processingStartedAt: Date | null = null;
    let error: { name: string; details: any } | null = null;
    let deleted = false;

    for (const event of events) {
      switch (event.type) {
        case ConversationEventType.MessageAdded: {
          const payload = decode(event.payload) as MessageAddedPayload;
          this.assertPreviousNodeExists(nodesById, payload.previousNodeId);
          const node: ConversationNode.MessageNode = {
            type: "Message",
            id: makeConversationNodeId(event.conversation_id, event.position),
            previousNodeId: payload.previousNodeId,
            message: payload.message,
            createdAt:
              "createdAt" in payload.message
                ? payload.message.createdAt
                : new Date(event.created_at),
          };
          nodes.push(node);
          nodesById.set(node.id, node);
          activeNodeId = node.id;
          break;
        }
        case ConversationEventType.MessageUpdated: {
          const payload = decode(event.payload) as MessageUpdatedPayload;
          const node = nodesById.get(payload.nodeId);
          if (!node || node.type !== "Message") {
            throw new Error(`Message node ${payload.nodeId} not found.`);
          }
          node.message = payload.message;
          break;
        }
        case ConversationEventType.TitleSet: {
          const payload = decode(event.payload) as TitleSetPayload;
          title = payload.title;
          break;
        }
        case ConversationEventType.ProcessingStarted: {
          const payload = decode(event.payload) as ProcessingStartedPayload;
          this.assertPreviousNodeExists(nodesById, payload.previousNodeId);
          activeNodeId = payload.previousNodeId;
          status = ConversationStatus.Processing;
          processingStartedAt = new Date(payload.processingStartedAt);
          error = null;
          break;
        }
        case ConversationEventType.ProcessingCompleted:
          status = ConversationStatus.Idle;
          processingStartedAt = null;
          error = null;
          break;
        case ConversationEventType.ProcessingFailed: {
          const payload = decode(event.payload) as ProcessingFailedPayload;
          this.assertPreviousNodeExists(nodesById, payload.previousNodeId);
          const node: ConversationNode.ErrorNode = {
            type: "Error",
            id: makeConversationNodeId(event.conversation_id, event.position),
            previousNodeId: payload.previousNodeId,
            error: payload.error,
            createdAt: new Date(event.created_at),
          };
          nodes.push(node);
          nodesById.set(node.id, node);
          activeNodeId = node.id;
          status = ConversationStatus.Error;
          processingStartedAt = null;
          error = payload.error;
          break;
        }
        case ConversationEventType.ConversationDeleted:
          deleted = true;
          break;
        default:
          throw new Error(`Unknown conversation event type ${event.type}.`);
      }
    }

    if (deleted) {
      return null;
    }

    return {
      id: conversation.id,
      assistant: conversation.assistant,
      title,
      contextFingerprint: conversation.context_fingerprint,
      nodes,
      activeNodeId,
      status,
      processingStartedAt,
      error,
      createdAt: new Date(conversation.created_at),
    } as ConversationEntity;
  }

  private assertPreviousNodeExists(
    nodesById: Map<ConversationNodeId, ConversationNode>,
    previousNodeId: ConversationNodeId | null,
  ): void {
    if (previousNodeId !== null && !nodesById.has(previousNodeId)) {
      throw new Error(
        `Previous conversation node ${previousNodeId} not found.`,
      );
    }
  }
}
