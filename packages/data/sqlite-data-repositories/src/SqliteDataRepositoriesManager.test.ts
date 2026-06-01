import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { encode } from "@msgpack/msgpack";
import {
  AssistantName,
  ConversationStatus,
  type Message,
  MessageContentPartType,
  MessageRole,
  ReasoningEffort,
  Theme,
} from "@superego/backend";
import { registerDataRepositoriesTests } from "@superego/executing-backend/tests";
import { Id } from "@superego/shared-utils";
import { afterAll, beforeAll, expect, it } from "vitest";
import SqliteDataRepositoriesManager from "./SqliteDataRepositoriesManager.js";

const databasesTmpDir = join(
  tmpdir(),
  "superego-sqlite-data-repositories-tests",
);
const defaultGlobalSettings = {
  appearance: { theme: Theme.Auto },
  inference: {
    providers: [],
    defaultInferenceOptions: {
      completion: null,
      transcription: null,
      fileInspection: null,
    },
  },
  assistants: {
    userInfo: null,
    userPreferences: null,
    developerPrompts: {
      [AssistantName.Factotum]: null,
      [AssistantName.CollectionCreator]: null,
    },
  },
};

beforeAll(() => {
  mkdirSync(databasesTmpDir, { recursive: true });
});
afterAll(() => {
  rmSync(databasesTmpDir, { recursive: true });
});

registerDataRepositoriesTests(() => {
  const dataRepositoriesManager = new SqliteDataRepositoriesManager({
    fileName: join(databasesTmpDir, `${crypto.randomUUID()}.sqlite`),
    defaultGlobalSettings,
    enableForeignKeyConstraints: false,
  });
  dataRepositoriesManager.runMigrations();
  return { dataRepositoriesManager };
});

it("migrates mutable conversations to synthesized event history", async () => {
  // Setup SUT
  const fileName = join(databasesTmpDir, `${crypto.randomUUID()}.sqlite`);
  const db = new DatabaseSync(fileName);
  db.exec(`
    CREATE TABLE "migrations" (
      "file_name" TEXT PRIMARY KEY,
      "applied_at" TEXT NOT NULL
    );

    CREATE TABLE "conversations" (
      "id" TEXT PRIMARY KEY NOT NULL,
      "assistant" TEXT NOT NULL,
      "title" TEXT,
      "context_fingerprint" TEXT NOT NULL,
      "messages" BLOB NOT NULL,
      "status" TEXT NOT NULL,
      "error" TEXT,
      "created_at" TEXT NOT NULL,
      "processing_started_at" TEXT,
      CHECK (json_valid("error"))
    );
  `);
  const insertMigration = db.prepare(`
    INSERT INTO "migrations" ("file_name", "applied_at")
    VALUES (?, ?)
  `);
  for (const migrationFileName of [
    "0000.sql",
    "0001.sql",
    "0002.sql",
    "0003.sql",
    "0004.sql",
    "0005.sql",
    "0006.sql",
    "0007.sql",
    "0008.sql",
    "0009.sql",
    "0010.sql",
    "0011.sql",
  ]) {
    insertMigration.run(migrationFileName, new Date(0).toISOString());
  }

  const conversationId = Id.generate.conversation();
  const userMessage = {
    id: Id.generate.message(),
    role: MessageRole.User,
    content: [{ type: MessageContentPartType.Text, text: "Question" }],
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  } satisfies Message.User;
  const assistantMessage = {
    id: Id.generate.message(),
    role: MessageRole.Assistant,
    content: [{ type: MessageContentPartType.Text, text: "Answer" }],
    reasoning: {},
    inferenceOptions: {
      completion: {
        providerModelRef: { providerName: "provider", modelId: "model" },
        reasoningEffort: ReasoningEffort.Medium,
      },
      transcription: null,
      fileInspection: null,
    },
    generationStats: {
      timeTaken: 0,
      inputTokens: 1,
      outputTokens: 1,
      totalTokens: 2,
    },
    createdAt: new Date("2026-01-01T00:01:00.000Z"),
  } satisfies Message.Assistant;
  const error = { name: "UnexpectedError", details: { message: "Failed" } };
  db.prepare(`
    INSERT INTO "conversations"
      (
        "id",
        "assistant",
        "title",
        "context_fingerprint",
        "messages",
        "status",
        "error",
        "created_at",
        "processing_started_at"
      )
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    conversationId,
    AssistantName.Factotum,
    "Migrated title",
    "contextFingerprint",
    Buffer.from(encode([userMessage, assistantMessage] satisfies Message[])),
    ConversationStatus.Error,
    JSON.stringify(error),
    "2026-01-01T00:00:00.000Z",
    null,
  );
  db.close();

  const dataRepositoriesManager = new SqliteDataRepositoriesManager({
    fileName,
    defaultGlobalSettings,
    enableForeignKeyConstraints: false,
  });

  // Exercise
  dataRepositoriesManager.runMigrations();

  // Verify
  const found = await dataRepositoriesManager.runInSerializableTransaction(
    async (repos) => ({
      action: "commit",
      returnValue: await repos.conversation.find(conversationId),
    }),
  );
  expect(found).toMatchObject({
    id: conversationId,
    assistant: AssistantName.Factotum,
    title: "Migrated title",
    contextFingerprint: "contextFingerprint",
    activeNodeId: `${conversationId}:4`,
    status: ConversationStatus.Error,
    error,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  });
  expect(found?.nodes).toEqual([
    {
      type: "Message",
      id: `${conversationId}:1`,
      previousNodeId: null,
      message: userMessage,
      createdAt: userMessage.createdAt,
    },
    {
      type: "Message",
      id: `${conversationId}:2`,
      previousNodeId: `${conversationId}:1`,
      message: assistantMessage,
      createdAt: assistantMessage.createdAt,
    },
    {
      type: "Error",
      id: `${conversationId}:4`,
      previousNodeId: `${conversationId}:2`,
      error,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    },
  ]);
});

it("returns a clear error when SQLite is locked", async () => {
  // Setup SUT
  const fileName = join(databasesTmpDir, `${crypto.randomUUID()}.sqlite`);
  const dataRepositoriesManager = new SqliteDataRepositoriesManager({
    fileName,
    defaultGlobalSettings,
    enableForeignKeyConstraints: false,
  });
  dataRepositoriesManager.runMigrations();
  const lockDb = new DatabaseSync(fileName);
  lockDb.exec("PRAGMA journal_mode = WAL");
  lockDb.exec("BEGIN IMMEDIATE");
  const collectionCategory = {
    id: Id.generate.collectionCategory(),
    name: "name",
    icon: null,
    parentId: null,
    createdAt: new Date(),
  };

  try {
    // Exercise
    const promise = dataRepositoriesManager.runInSerializableTransaction(
      async (repos) => {
        await repos.collectionCategory.insert(collectionCategory);
        return { action: "commit", returnValue: null };
      },
    );

    // Verify
    await expect(promise).rejects.toThrow("SQLite database is locked.");
  } finally {
    lockDb.exec("ROLLBACK");
    lockDb.close();
  }
});
