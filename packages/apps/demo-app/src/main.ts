/// <reference types="vite/client" />
import { AssistantName, Theme } from "@superego/backend";
import { renderBrowserApp } from "@superego/browser-app";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { FakeJavascriptSandbox } from "@superego/fake-javascript-sandbox/browser";
import { OpenAICompatInferenceServiceFactory } from "@superego/openai-compat-inference-service";
import { QueryClient } from "@tanstack/react-query";

const dataRepositoriesManager = new DemoDataRepositoriesManager({
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
});
const backend = new ExecutingBackend(
  dataRepositoriesManager,
  new FakeJavascriptSandbox(),
  new OpenAICompatInferenceServiceFactory(),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      networkMode: "always",
    },
    mutations: {
      networkMode: "always",
    },
  },
});

renderBrowserApp(backend, queryClient);

(window as any).loadDemoData = async () =>
  dataRepositoriesManager.loadData(
    (await import("./demoData/demoData.js")).default,
  );
