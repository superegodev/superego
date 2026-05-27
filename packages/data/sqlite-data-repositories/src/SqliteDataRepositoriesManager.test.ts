import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { AssistantName, Theme } from "@superego/backend";
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
