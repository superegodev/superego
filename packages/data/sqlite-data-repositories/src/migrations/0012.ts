import type { DatabaseSync } from "node:sqlite";
import { decode, encode } from "@msgpack/msgpack";
import { ConversationStatus, type Message } from "@superego/backend";
import { makeConversationNodeId } from "../types/SqliteConversation.js";

type OldSqliteConversation = {
  id: string;
  assistant: string;
  title: string | null;
  context_fingerprint: string;
  messages: Buffer;
  status: ConversationStatus;
  processing_started_at: string | null;
  error: string | null;
  created_at: string;
};

export default function m0012(db: DatabaseSync): void {
  db.exec(`ALTER TABLE "conversations" RENAME TO "conversations_old"`);
  db.exec(`
    CREATE TABLE "conversations" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "assistant" TEXT NOT NULL,
      "context_fingerprint" TEXT NOT NULL,
      "created_at" TEXT NOT NULL
    );

    CREATE TABLE "conversation_events" (
      "conversation_id" TEXT NOT NULL,
      "position" INTEGER NOT NULL,
      "type" TEXT NOT NULL,
      "payload" BLOB NOT NULL,
      "created_at" TEXT NOT NULL,
      PRIMARY KEY ("conversation_id", "position"),
      FOREIGN KEY ("conversation_id") REFERENCES "conversations" ("id")
    );

    CREATE INDEX "idx__conversation_events__on__conversation_id" ON "conversation_events" (
      "conversation_id"
    );

    CREATE INDEX "idx__conversation_events__on__type" ON "conversation_events" (
      "type"
    );
  `);

  const oldConversations = db
    .prepare(`SELECT * FROM "conversations_old" ORDER BY "created_at" ASC`)
    .all() as OldSqliteConversation[];
  const insertConversation = db.prepare(`
    INSERT INTO "conversations"
      ("id", "assistant", "context_fingerprint", "created_at")
    VALUES
      (?, ?, ?, ?)
  `);
  const insertEvent = db.prepare(`
    INSERT INTO "conversation_events"
      ("conversation_id", "position", "type", "payload", "created_at")
    VALUES
      (?, ?, ?, ?, ?)
  `);

  for (const conversation of oldConversations) {
    insertConversation.run(
      conversation.id,
      conversation.assistant,
      conversation.context_fingerprint,
      conversation.created_at,
    );

    let position = 1;
    let previousNodeId: string | null = null;
    const messages = decode(conversation.messages) as Message[];
    for (const message of messages) {
      insertEvent.run(
        conversation.id,
        position,
        "MessageAdded",
        Buffer.from(encode({ previousNodeId, message })),
        "createdAt" in message
          ? new Date(message.createdAt).toISOString()
          : conversation.created_at,
      );
      previousNodeId = makeConversationNodeId(conversation.id as any, position);
      position++;
    }

    if (conversation.title !== null) {
      insertEvent.run(
        conversation.id,
        position++,
        "TitleSet",
        Buffer.from(encode({ title: conversation.title })),
        conversation.created_at,
      );
    }

    if (conversation.status === ConversationStatus.Processing) {
      const processingStartedAt =
        conversation.processing_started_at ?? conversation.created_at;
      insertEvent.run(
        conversation.id,
        position++,
        "ProcessingStarted",
        Buffer.from(
          encode({
            previousNodeId,
            processingStartedAt: new Date(processingStartedAt),
          }),
        ),
        processingStartedAt,
      );
    }

    if (conversation.status === ConversationStatus.Error) {
      insertEvent.run(
        conversation.id,
        position++,
        "ProcessingFailed",
        Buffer.from(
          encode({
            previousNodeId,
            error: conversation.error
              ? JSON.parse(conversation.error)
              : { name: "UnexpectedError", details: null },
          }),
        ),
        conversation.created_at,
      );
    }
  }

  db.exec(`DROP TABLE "conversations_old"`);
}
