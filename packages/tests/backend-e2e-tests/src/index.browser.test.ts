import {
  AssistantName,
  InferenceProviderDriver,
  Theme,
} from "@superego/backend";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { FakeJavascriptSandbox } from "@superego/fake-javascript-sandbox/browser";
import { MonacoTypescriptCompiler } from "@superego/monaco-typescript-compiler";
import registerTests from "./registerTests.js";
import MockInferenceServiceFactory from "./utils/MockInferenceServiceFactory.js";

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
            name: "modelName",
            capabilities: {
              reasoning: false,
              audioUnderstanding: false,
              imageUnderstanding: false,
              pdfUnderstanding: false,
              webSearching: false,
            },
          },
        ],
      },
    ],
    defaults: {
      chat: { providerName: "providerName", modelName: "modelName" },
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

registerTests((connector) => ({
  backend: new ExecutingBackend(
    new DemoDataRepositoriesManager(defaultGlobalSettings, crypto.randomUUID()),
    new FakeJavascriptSandbox(),
    new MonacoTypescriptCompiler(() => import("monaco-editor")),
    new MockInferenceServiceFactory(),
    connector ? [connector] : [],
  ),
}));
