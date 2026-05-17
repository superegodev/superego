import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { decode, encode } from "@msgpack/msgpack";
import { AppVersionFileUtils, AssistantName, Theme } from "@superego/backend";
import { registerDataRepositoriesTests } from "@superego/executing-backend/tests";
import { Id } from "@superego/shared-utils";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import migrate from "./migrations/migrate.js";
import SqliteDataRepositoriesManager from "./SqliteDataRepositoriesManager.js";

const databasesTmpDir = join(
  tmpdir(),
  "superego-sqlite-data-repositories-tests",
);

beforeAll(() => {
  mkdirSync(databasesTmpDir, { recursive: true });
});
afterAll(() => {
  rmSync(databasesTmpDir, { recursive: true });
});

registerDataRepositoriesTests(() => {
  const dataRepositoriesManager = new SqliteDataRepositoriesManager({
    fileName: join(databasesTmpDir, `${crypto.randomUUID()}.sqlite`),
    defaultGlobalSettings: {
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
    },
    enableForeignKeyConstraints: false,
  });
  dataRepositoriesManager.runMigrations();
  return { dataRepositoriesManager };
});

describe("migrations", () => {
  it("migrates legacy source payloads into unsupported static placeholders", () => {
    // Setup SUT
    const db = makePre0011Database();
    const collectionId = Id.generate.collection();
    const collectionVersionId = Id.generate.collectionVersion();
    const invalidCollectionId = Id.generate.collection();
    db.prepare(
      `INSERT INTO "collection_versions" ("id", "collection_id", "is_latest") VALUES (?, ?, ?)`,
    ).run(collectionVersionId, collectionId, 1);
    db.prepare(
      `
        INSERT INTO "app_versions"
          (
            "id",
            "previous_version_id",
            "app_id",
            "target_collections",
            "files",
            "created_at",
            "is_latest"
          )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
    ).run(
      Id.generate.appVersion(),
      null,
      Id.generate.app(),
      encode([collectionId, invalidCollectionId]),
      encode({
        "/main.js": {
          source: "export default function App() { return null; }",
          compiled: "legacy compiled output",
        },
      }),
      new Date().toISOString(),
      1,
    );

    // Exercise
    migrate(db);

    // Verify
    const row = db.prepare(`SELECT * FROM "app_versions"`).get() as any;
    const targetCollections = decode(row.target_collections);
    const files = decode(row.files) as Record<string, any>;
    expect(row.entrypoint).toBe(AppVersionFileUtils.APP_VERSION_ENTRYPOINT);
    expect(targetCollections).toEqual([
      { id: collectionId, versionId: collectionVersionId },
    ]);
    expect(files["/dist/index.html"]).toMatchObject({
      role: "build",
      mimeType: "text/html",
    });
    expect(files["/src/legacy/README.md"]).toMatchObject({
      role: "source",
      mimeType: "text/plain",
    });
    expect(files["/src/legacy/main.js"]).toMatchObject({
      role: "source",
      mimeType: "text/plain",
      content: "export default function App() { return null; }",
    });
    expect(
      AppVersionFileUtils.validateAppVersionFiles(
        AppVersionFileUtils.APP_VERSION_ENTRYPOINT,
        files,
      ),
    ).toEqual([]);
    db.close();
  });

  it("keeps valid static files, converts config role, and drops checkout-generated files", () => {
    // Setup SUT
    const db = makePre0011Database();
    const collectionId = Id.generate.collection();
    const collectionVersionId = Id.generate.collectionVersion();
    db.prepare(
      `INSERT INTO "collection_versions" ("id", "collection_id", "is_latest") VALUES (?, ?, ?)`,
    ).run(collectionVersionId, collectionId, 1);
    db.prepare(
      `
        INSERT INTO "app_versions"
          (
            "id",
            "previous_version_id",
            "app_id",
            "target_collections",
            "files",
            "created_at",
            "is_latest"
          )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
    ).run(
      Id.generate.appVersion(),
      null,
      Id.generate.app(),
      encode([{ id: collectionId, versionId: collectionVersionId }]),
      encode({
        "/src/main.js": {
          role: "source",
          mimeType: "text/javascript",
          content: "console.log('hello');",
        },
        "/dist/index.html": {
          role: "build",
          mimeType: "text/html",
          content: "<!doctype html>",
        },
        "/.superegoignore": {
          role: "config",
          mimeType: "text/plain",
          content: "node_modules/\n",
        },
        "/superego/app.ts": {
          role: "generated",
          mimeType: "text/typescript",
          content: "",
        },
      }),
      new Date().toISOString(),
      1,
    );

    // Exercise
    migrate(db);

    // Verify
    const row = db.prepare(`SELECT * FROM "app_versions"`).get() as any;
    const files = decode(row.files) as Record<string, any>;
    expect(files["/.superegoignore"]).toMatchObject({
      role: "projectConfig",
      mimeType: "text/plain",
      content: "node_modules/\n",
    });
    expect(files["/superego/app.ts"]).toBeUndefined();
    expect(
      AppVersionFileUtils.validateAppVersionFiles(
        AppVersionFileUtils.APP_VERSION_ENTRYPOINT,
        files,
      ),
    ).toEqual([]);
    db.close();
  });
});

function makePre0011Database(): DatabaseSync {
  const db = new DatabaseSync(
    join(databasesTmpDir, `${crypto.randomUUID()}.sqlite`),
  );
  db.exec(`
    CREATE TABLE "migrations" (
      "file_name" TEXT PRIMARY KEY,
      "applied_at" TEXT NOT NULL
    );
    CREATE TABLE "collection_versions" (
      "id" TEXT PRIMARY KEY,
      "collection_id" TEXT NOT NULL,
      "is_latest" INTEGER NOT NULL
    );
    CREATE TABLE "app_versions" (
      "id" TEXT PRIMARY KEY,
      "previous_version_id" TEXT,
      "app_id" TEXT NOT NULL,
      "target_collections" BLOB NOT NULL,
      "files" BLOB NOT NULL,
      "created_at" TEXT NOT NULL,
      "is_latest" INTEGER NOT NULL
    );
  `);
  const insertMigration = db.prepare(
    `INSERT INTO "migrations" ("file_name", "applied_at") VALUES (?, ?)`,
  );
  for (const fileName of [
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
  ]) {
    insertMigration.run(fileName, new Date().toISOString());
  }
  return db;
}
