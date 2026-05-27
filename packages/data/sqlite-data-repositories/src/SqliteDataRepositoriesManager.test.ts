import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { AssistantName, Theme } from "@superego/backend";
import { registerDataRepositoriesTests } from "@superego/executing-backend/tests";
import { Id } from "@superego/shared-utils";
import { afterAll, beforeAll, expect, it } from "vitest";
import m0000 from "./migrations/0000.sql?raw";
import m0001 from "./migrations/0001.sql?raw";
import m0002 from "./migrations/0002.sql?raw";
import m0003 from "./migrations/0003.sql?raw";
import m0004 from "./migrations/0004.sql?raw";
import m0005 from "./migrations/0005.sql?raw";
import m0006 from "./migrations/0006.sql?raw";
import m0007 from "./migrations/0007.sql?raw";
import m0008 from "./migrations/0008.sql?raw";
import m0009 from "./migrations/0009.sql?raw";
import m0010 from "./migrations/0010.sql?raw";
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

it("migration 0011 removes remote metadata but preserves local data", () => {
  // Setup SUT
  const fileName = join(databasesTmpDir, `${crypto.randomUUID()}.sqlite`);
  const db = new DatabaseSync(fileName);
  const preCleanupMigrations = {
    "0000.sql": m0000,
    "0001.sql": m0001,
    "0002.sql": m0002,
    "0003.sql": m0003,
    "0004.sql": m0004,
    "0005.sql": m0005,
    "0006.sql": m0006,
    "0007.sql": m0007,
    "0008.sql": m0008,
    "0009.sql": m0009,
    "0010.sql": m0010,
  };
  db.exec(`
    CREATE TABLE "migrations" (
      "file_name" TEXT PRIMARY KEY,
      "applied_at" TEXT NOT NULL
    )
  `);
  const insertMigration = db.prepare(
    `INSERT INTO "migrations" ("file_name", "applied_at") VALUES (?, ?)`,
  );
  for (const [fileName, migration] of Object.entries(preCleanupMigrations)) {
    db.exec(migration);
    insertMigration.run(fileName, new Date().toISOString());
  }

  const collectionId = Id.generate.collection();
  const collectionVersionId = Id.generate.collectionVersion();
  const documentId = Id.generate.document();
  const documentVersionId = Id.generate.documentVersion();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO "collections" ("id", "settings", "remote", "created_at") VALUES (?, ?, ?, ?)`,
  ).run(
    collectionId,
    JSON.stringify({
      name: "name",
      icon: null,
      collectionCategoryId: null,
      defaultCollectionViewAppId: null,
      description: null,
      assistantInstructions: null,
      redirectToCollectionAfterDocumentCreation: false,
    }),
    Buffer.from([1]),
    now,
  );
  db.prepare(`
    INSERT INTO "collection_versions"
      (
        "id",
        "previous_version_id",
        "collection_id",
        "schema",
        "settings",
        "migration",
        "created_at",
        "is_latest",
        "remote_converters"
      )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    collectionVersionId,
    null,
    collectionId,
    JSON.stringify({
      types: { Root: { dataType: "Struct", properties: {} } },
      rootType: "Root",
    }),
    JSON.stringify({
      contentBlockingKeysGetter: null,
      contentSummaryGetter: { source: "", compiled: "" },
      defaultDocumentViewUiOptions: null,
    }),
    null,
    now,
    1,
    Buffer.from([2]),
  );
  db.prepare(`
    INSERT INTO "documents"
      (
        "id",
        "collection_id",
        "created_at",
        "remote_id",
        "remote_url",
        "latest_remote_document"
      )
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    documentId,
    collectionId,
    now,
    "remoteDocumentId",
    "https://example.com/remote-document",
    Buffer.from([3]),
  );
  db.prepare(`
    INSERT INTO "document_versions"
      (
        "id",
        "previous_version_id",
        "collection_id",
        "document_id",
        "collection_version_id",
        "content_delta",
        "content_snapshot",
        "created_at",
        "is_latest",
        "conversation_id",
        "created_by",
        "remote_id",
        "referenced_documents",
        "content_blocking_keys",
        "content_summary"
      )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    documentVersionId,
    null,
    collectionId,
    documentId,
    collectionVersionId,
    null,
    JSON.stringify({}),
    now,
    1,
    null,
    "Connector",
    "remoteDocumentVersionId",
    JSON.stringify([]),
    null,
    JSON.stringify({ success: true, data: {} }),
  );
  db.prepare(`
    INSERT INTO "background_jobs"
      (
        "id",
        "name",
        "input",
        "status",
        "enqueued_at",
        "started_processing_at",
        "finished_processing_at",
        "error"
      )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    Id.generate.backgroundJob(),
    "DownSyncCollection",
    JSON.stringify({ id: collectionId }),
    "Enqueued",
    now,
    null,
    null,
    null,
  );
  db.prepare(`
    INSERT INTO "background_jobs"
      (
        "id",
        "name",
        "input",
        "status",
        "enqueued_at",
        "started_processing_at",
        "finished_processing_at",
        "error"
      )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    Id.generate.backgroundJob(),
    "ProcessConversation",
    JSON.stringify({ id: Id.generate.conversation() }),
    "Enqueued",
    now,
    null,
    null,
    null,
  );
  db.close();

  // Exercise
  const dataRepositoriesManager = new SqliteDataRepositoriesManager({
    fileName,
    defaultGlobalSettings,
    enableForeignKeyConstraints: false,
  });
  dataRepositoriesManager.runMigrations();
  const migratedDb = new DatabaseSync(fileName);

  try {
    // Verify
    expect(tableColumns(migratedDb, "collections")).not.toContain("remote");
    expect(tableColumns(migratedDb, "collection_versions")).not.toContain(
      "remote_converters",
    );
    expect(tableColumns(migratedDb, "documents")).not.toEqual(
      expect.arrayContaining([
        "remote_id",
        "remote_url",
        "latest_remote_document",
      ]),
    );
    expect(tableColumns(migratedDb, "document_versions")).not.toContain(
      "remote_id",
    );
    const documentIndexNames = migratedDb
      .prepare(`PRAGMA index_list("documents")`)
      .all()
      .map((index) => (index as { name: string }).name);
    expect(documentIndexNames).not.toContain(
      "idx__documents__on__collection_id_remote_id__unique",
    );
    expect(
      migratedDb.prepare(`SELECT COUNT(*) AS "count" FROM "documents"`).get(),
    ).toEqual({ count: 1 });
    expect(
      migratedDb
        .prepare(`SELECT COUNT(*) AS "count" FROM "document_versions"`)
        .get(),
    ).toEqual({ count: 1 });
    expect(
      migratedDb.prepare(`SELECT "created_by" FROM "document_versions"`).get(),
    ).toEqual({ created_by: "User" });
    expect(
      migratedDb
        .prepare(`SELECT "name" FROM "background_jobs" ORDER BY "name"`)
        .all(),
    ).toEqual([{ name: "ProcessConversation" }]);
  } finally {
    migratedDb.close();
  }
});

function tableColumns(db: DatabaseSync, table: string): string[] {
  return db
    .prepare(`PRAGMA table_info("${table}")`)
    .all()
    .map((column) => (column as { name: string }).name);
}
