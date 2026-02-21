import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AssistantName, Theme } from "@superego/backend";
import { ExecutingBackend } from "@superego/executing-backend";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/nodejs";
import { SqliteDataRepositoriesManager } from "@superego/sqlite-data-repositories";
import { TscTypescriptCompiler } from "@superego/tsc-typescript-compiler";
import { afterAll, beforeAll } from "vitest";
import registerTests from "./registerTests.js";
import MockInferenceServiceFactory from "./utils/MockInferenceServiceFactory.js";

const databasesTmpDir = join(tmpdir(), "superego-backend-e2e-tests");

beforeAll(() => {
  mkdirSync(databasesTmpDir, { recursive: true });
});
afterAll(() => {
  rmSync(databasesTmpDir, { recursive: true });
});

const defaultGlobalSettings = {
  appearance: { theme: Theme.Auto },
  inference: {
    providers: [],
    models: [],
    defaultChatModel: null,
    defaultTranscriptionModel: null,
    defaultFileInspectionModel: null,
  },
  assistants: {
    userName: null,
    developerPrompts: {
      [AssistantName.Factotum]: null,
      [AssistantName.CollectionCreator]: null,
    },
  },
};

registerTests((connector) => {
  const dataRepositoriesManager = new SqliteDataRepositoriesManager({
    fileName: join(databasesTmpDir, `${crypto.randomUUID()}.sqlite`),
    defaultGlobalSettings: defaultGlobalSettings,
  });
  dataRepositoriesManager.runMigrations();

  return {
    backend: new ExecutingBackend(
      dataRepositoriesManager,
      new QuickjsJavascriptSandbox(),
      new TscTypescriptCompiler(),
      new MockInferenceServiceFactory(),
      connector ? [connector] : [],
    ),
  };
});
