import {
  AssistantName,
  InferenceProviderDriver,
  ReasoningEffort,
  Theme,
} from "@superego/backend";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { FakeTypescriptSandbox } from "@superego/fake-typescript-sandbox/browser";
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
        driver: InferenceProviderDriver.OpenResponses,
        models: [
          {
            id: "modelId",
            name: "modelId",
            capabilities: {
              audioUnderstanding: true,
              imageUnderstanding: false,
              pdfUnderstanding: false,
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
        reasoningEffort: ReasoningEffort.Medium,
      },
      transcription: null,
      fileInspection: null,
    },
  },
  assistants: {
    userInfo: null,
    userPreferences: null,
    developerPrompts: {
      [AssistantName.Factotum]: null,
      [AssistantName.CollectionCreator]: null,
    },
  },
};

registerTests(({ inferenceService, inferenceSettings, config } = {}) => {
  const effectiveGlobalSettings = inferenceSettings
    ? { ...defaultGlobalSettings, inference: inferenceSettings }
    : defaultGlobalSettings;

  return {
    backend: new ExecutingBackend(
      new DemoDataRepositoriesManager(
        effectiveGlobalSettings,
        crypto.randomUUID(),
      ),
      new FakeTypescriptSandbox(),
      new MonacoTypescriptCompiler(() => import("monaco-editor")),
      inferenceService
        ? { create: () => inferenceService }
        : new MockInferenceServiceFactory(),
      config,
    ),
  };
});
