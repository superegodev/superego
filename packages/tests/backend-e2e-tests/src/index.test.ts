import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AssistantName, Theme } from "@superego/backend";
import { ExecutingBackend } from "@superego/executing-backend";
import { OpenAICompatInferenceServiceFactory } from "@superego/openai-compat-inference-service";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/nodejs";
import { SqliteDataRepositoriesManager } from "@superego/sqlite-data-repositories";
import { afterAll, assert, beforeAll, describe } from "vitest";
import BooleanOracle from "./BooleanOracle.js";
import registerBackendTests from "./registerBackendTests.js";

const databasesTmpDir = join(tmpdir(), "superego-backend-e2e-tests");

beforeAll(() => {
  mkdirSync(databasesTmpDir, { recursive: true });
});
afterAll(() => {
  rmSync(databasesTmpDir, { recursive: true });
});

describe("Sqlite, Quickjs, Kimi K2 via Groq", () => {
  registerBackendTests(async () => {
    const groqApiKey = process.env["GROQ_API_KEY"];
    assert.isDefined(groqApiKey);
    const defaultGlobalSettings = {
      appearance: { theme: Theme.Auto },
      inference: {
        completions: {
          provider: {
            baseUrl: "https://api.groq.com/openai/v1/chat/completions",
            apiKey: groqApiKey,
          },
          model: "moonshotai/kimi-k2-instruct-0905",
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
    const dataRepositoriesManager = new SqliteDataRepositoriesManager({
      fileName: join(databasesTmpDir, `${crypto.randomUUID()}.sqlite`),
      defaultGlobalSettings: defaultGlobalSettings,
    });
    dataRepositoriesManager.runMigrations();
    const javascriptSandbox = new QuickjsJavascriptSandbox();
    const inferenceServiceFactory = new OpenAICompatInferenceServiceFactory();
    const backend = new ExecutingBackend(
      dataRepositoriesManager,
      javascriptSandbox,
      inferenceServiceFactory,
    );

    const booleanOracle = new BooleanOracle(
      inferenceServiceFactory.create(defaultGlobalSettings.inference),
    );
    return { backend, booleanOracle: booleanOracle.ask.bind(booleanOracle) };
  });
});
