import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AICompletionModel, Theme } from "@superego/backend";
import { registerDataRepositoriesTests } from "@superego/executing-backend/tests";
import { afterAll, beforeAll } from "vitest";
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

registerDataRepositoriesTests(async () => {
  const dataRepositoriesManager = new SqliteDataRepositoriesManager({
    fileName: join(databasesTmpDir, `${crypto.randomUUID()}.sqlite`),
    defaultGlobalSettings: {
      appearance: { theme: Theme.Auto },
      aiAssistant: {
        providers: { groq: { apiKey: null, baseUrl: null } },
        completions: { defaultModel: AICompletionModel.GroqKimiK2Instruct },
      },
    },
    enableForeignKeyConstraints: false,
  });
  dataRepositoriesManager.runMigrations();
  return { dataRepositoriesManager };
});
