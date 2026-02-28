import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  AssistantName,
  InferenceProviderDriver,
  Theme,
} from "@superego/backend";
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
    providers: [
      {
        name: "providerName",
        baseUrl: "http://localhost",
        apiKey: null,
        driver: InferenceProviderDriver.OpenRouter,
        models: [
          {
            id: "modelId",
            name: "modelId",
            capabilities: {
              reasoning: false,
              audioUnderstanding: true,
              imageUnderstanding: false,
              pdfUnderstanding: false,
              webSearching: false,
            },
          },
        ],
      },
    ],
    defaultInferenceOptions: {
      completion: {
        providerModelRef: {
          providerName: "providerName",
          modelId: "modelId",
        },
      },
      transcription: null,
      fileInspection: null,
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

registerTests(({ connector, inferenceService, inferenceSettings } = {}) => {
  const effectiveGlobalSettings = inferenceSettings
    ? { ...defaultGlobalSettings, inference: inferenceSettings }
    : defaultGlobalSettings;

  const dataRepositoriesManager = new SqliteDataRepositoriesManager({
    fileName: join(databasesTmpDir, `${crypto.randomUUID()}.sqlite`),
    defaultGlobalSettings: effectiveGlobalSettings,
  });
  dataRepositoriesManager.runMigrations();

  return {
    backend: new ExecutingBackend(
      dataRepositoriesManager,
      new QuickjsJavascriptSandbox(),
      new TscTypescriptCompiler(),
      inferenceService
        ? { create: () => inferenceService }
        : new MockInferenceServiceFactory(),
      connector ? [connector] : [],
    ),
  };
});
