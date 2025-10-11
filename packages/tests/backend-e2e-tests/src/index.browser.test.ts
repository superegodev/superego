import { AssistantName, Theme } from "@superego/backend";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { FakeJavascriptSandbox } from "@superego/fake-javascript-sandbox/browser";
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

registerTests((connector) => {
  // Javascript sandbox
  const javascriptSandbox = new FakeJavascriptSandbox();

  // Inference service
  const inferenceServiceFactory = new OpenAICompatInferenceServiceFactory();

  // Data repositories
  const dataRepositoriesManager = new DemoDataRepositoriesManager(
    defaultGlobalSettings,
    crypto.randomUUID(),
  );

  // Backend
  const backend = new ExecutingBackend(
    dataRepositoriesManager,
    javascriptSandbox,
    inferenceServiceFactory,
    connector ? [connector] : [],
  );

  return { backend };
});
