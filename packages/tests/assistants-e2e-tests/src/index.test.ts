import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AssistantName, Theme } from "@superego/backend";
import { ExecutingBackend } from "@superego/executing-backend";
import { OpenAICompatInferenceServiceFactory } from "@superego/openai-compat-inference-service";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/nodejs";
import { SqliteDataRepositoriesManager } from "@superego/sqlite-data-repositories";
import { afterAll, assert, beforeAll, describe } from "vitest";
import registerTests from "./registerTests.js";
import BooleanOracle from "./utils/BooleanOracle.js";

const completionsBaseUrl = import.meta.env[
  "SUPEREGO_TESTS_COMPLETIONS_BASE_URL"
];
assert.isDefined(completionsBaseUrl);
const completionsApiKey = import.meta.env["SUPEREGO_TESTS_COMPLETIONS_API_KEY"];
assert.isDefined(completionsApiKey);

const databasesTmpDir = join(tmpdir(), "superego-backend-e2e-tests");
beforeAll(() => {
  mkdirSync(databasesTmpDir, { recursive: true });
});
afterAll(() => {
  rmSync(databasesTmpDir, { recursive: true });
});

// Javascript sandbox
const javascriptSandbox = new QuickjsJavascriptSandbox();

// Inference service
const inferenceServiceFactory = new OpenAICompatInferenceServiceFactory();

// Boolean oracle
const booleanOracle = new BooleanOracle(
  inferenceServiceFactory.create({
    completions: {
      provider: { baseUrl: completionsBaseUrl, apiKey: completionsApiKey },
      model: "openai/gpt-oss-120b",
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
  }),
);

const models = [
  "qwen/qwen3-coder",
  "moonshotai/kimi-k2-0905",
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "mistralai/mistral-small-3.2-24b-instruct",
  "mistralai/mistral-medium-3.1",
];

describe.concurrent.each(models)("%s", (model) => {
  registerTests(async () => {
    const defaultGlobalSettings = {
      appearance: { theme: Theme.Auto },
      inference: {
        completions: {
          provider: { baseUrl: completionsBaseUrl, apiKey: completionsApiKey },
          model: model,
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
        developerPrompts: {
          [AssistantName.Factotum]: null,
          [AssistantName.CollectionManager]: null,
        },
      },
    };

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
    );

    return { backend, booleanOracle };
  });
});
