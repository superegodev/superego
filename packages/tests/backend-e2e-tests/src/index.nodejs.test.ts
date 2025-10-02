import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AssistantName, Theme } from "@superego/backend";
import { ExecutingBackend } from "@superego/executing-backend";
import { OpenAICompatInferenceServiceFactory } from "@superego/openai-compat-inference-service";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/nodejs";
import { SqliteDataRepositoriesManager } from "@superego/sqlite-data-repositories";
import { afterAll, beforeAll } from "vitest";
import registerTests from "./registerTests.js";

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
    chatCompletions: {
      provider: { baseUrl: null, apiKey: null },
      model: null,
    },
    transcriptions: {
      provider: { baseUrl: null, apiKey: null },
      model: null,
    },
    speech: {
      provider: { baseUrl: null, apiKey: null },
      model: null,
      voice: null,
    },
  },
  assistants: {
    userName: null,
    developerPrompts: {
      [AssistantName.Factotum]: null,
      [AssistantName.CollectionCreator]: null,
    },
  },
};

registerTests(async () => {
  // Javascript sandbox
  const javascriptSandbox = new QuickjsJavascriptSandbox();

  // Inference service
  const inferenceServiceFactory = new OpenAICompatInferenceServiceFactory();

  // Data repositories
  const dataRepositoriesManager = new SqliteDataRepositoriesManager({
    fileName: join(databasesTmpDir, `${crypto.randomUUID()}.sqlite`),
    defaultGlobalSettings: defaultGlobalSettings,
  });
  dataRepositoriesManager.runMigrations();

  // Backend
  const backend = new ExecutingBackend(
    dataRepositoriesManager,
    javascriptSandbox,
    inferenceServiceFactory,
    [],
  );

  return { backend };
});
