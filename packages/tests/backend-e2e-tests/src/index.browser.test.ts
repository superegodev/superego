import { AssistantName, Theme } from "@superego/backend";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { FakeJavascriptSandbox } from "@superego/fake-javascript-sandbox/browser";
import { MonacoTypescriptCompiler } from "@superego/monaco-typescript-compiler";
import { OpenAICompatInferenceServiceFactory } from "@superego/openai-compat-inference-service";
import registerTests from "./registerTests.js";

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

registerTests((connector) => ({
  backend: new ExecutingBackend(
    new DemoDataRepositoriesManager(defaultGlobalSettings, crypto.randomUUID()),
    new FakeJavascriptSandbox(),
    new MonacoTypescriptCompiler(() => import("monaco-editor")),
    new OpenAICompatInferenceServiceFactory(),
    connector ? [connector] : [],
  ),
}));
