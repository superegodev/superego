import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AssistantName, Theme } from "@superego/backend";
import { ExecutingBackend } from "@superego/executing-backend";
import { OpenAICompatInferenceServiceFactory } from "@superego/openai-compat-inference-service";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/nodejs";
import { SqliteDataRepositoriesManager } from "@superego/sqlite-data-repositories";
import { TscTypescriptCompiler } from "@superego/tsc-typescript-compiler";
import { afterAll, assert, beforeAll, describe } from "vitest";
import registerTests from "./registerTests.js";
import Evaluator from "./utils/Evaluator.js";

const chatCompletionsBaseUrl = import.meta.env[
  "SUPEREGO_TESTS_CHAT_COMPLETIONS_BASE_URL"
];
assert.isDefined(chatCompletionsBaseUrl);
const chatCompletionsApiKey = import.meta.env[
  "SUPEREGO_TESTS_CHAT_COMPLETIONS_API_KEY"
];
assert.isDefined(chatCompletionsApiKey);

const databasesTmpDir = join(tmpdir(), "superego-assistants-e2e-tests");
beforeAll(() => {
  mkdirSync(databasesTmpDir, { recursive: true });
});
afterAll(() => {
  rmSync(databasesTmpDir, { recursive: true });
});

// Javascript sandbox
const javascriptSandbox = new QuickjsJavascriptSandbox();

// Typescript compiler
const typescriptCompiler = new TscTypescriptCompiler();

// Inference service
const inferenceServiceFactory = new OpenAICompatInferenceServiceFactory();

// Evaluator
const evaluatorModel = "openai/gpt-oss-120b";
const evaluator = new Evaluator(
  inferenceServiceFactory.create({
    chatCompletions: {
      provider: {
        baseUrl: chatCompletionsBaseUrl,
        apiKey: chatCompletionsApiKey,
      },
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

  /* Anthropic */
  // "anthropic/claude-sonnet-4",

  /* Alibaba Cloud */
  // "qwen/qwen3-coder",

  /* Moonshot AI */
  // "moonshotai/kimi-k2-0905",

  /* Mistral */
  // "mistralai/mistral-small-3.2-24b-instruct",
  // "mistralai/mistral-medium-3.1",

  /* xAI */
  // "x-ai/grok-4-fast",
];

describe.concurrent.each(
  assistantsModels,
)(`Assistants model: %s; Evaluator model: ${evaluatorModel}`, (model) => {
  registerTests(() => {
    const defaultGlobalSettings = {
      appearance: { theme: Theme.Auto },
      inference: {
        chatCompletions: {
          provider: {
            baseUrl: chatCompletionsBaseUrl,
            apiKey: chatCompletionsApiKey,
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
        userName: null,
        developerPrompts: {
          [AssistantName.Factotum]: null,
          [AssistantName.CollectionCreator]: null,
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
      typescriptCompiler,
      inferenceServiceFactory,
      [],
    );

    return { backend, booleanOracle: evaluator };
  });
});
