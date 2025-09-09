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
import Evaluator from "./utils/Evaluator.js";

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

// Evaluator
const evaluatorModel = "openai/gpt-oss-120b";
const evaluator = new Evaluator(
  inferenceServiceFactory.create({
    completions: {
      provider: { baseUrl: completionsBaseUrl, apiKey: completionsApiKey },
      model: evaluatorModel,
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

const assistantsModels = [
  /* OpenAI */
  // "openai/gpt-4.1-mini",
  // "openai/gpt-4o-mini",
  // "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",

  /* Google */
  // "google/gemini-2.5-flash",
  // "google/gemini-2.5-flash-lite",

  /* Anthropic */
  // "anthropic/claude-sonnet-4",

  /* Alibaba Cloud */
  // "qwen/qwen3-coder",

  /* Moonshot AI */
  // "moonshotai/kimi-k2-0905",

  /* Mistral */
  // "mistralai/mistral-small-3.2-24b-instruct",
  // "mistralai/mistral-medium-3.1",
];

describe.concurrent.each(assistantsModels)(
  `Assistants model: %s; Evaluator model: ${evaluatorModel}`,
  (model) => {
    registerTests(async () => {
      const defaultGlobalSettings = {
        appearance: { theme: Theme.Auto },
        inference: {
          completions: {
            provider: {
              baseUrl: completionsBaseUrl,
              apiKey: completionsApiKey,
            },
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

      return { backend, booleanOracle: evaluator };
    });
  },
);
