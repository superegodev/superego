/// <reference types="vite/client" />
import { AssistantName, Theme } from "@superego/backend";
import { renderBrowserApp } from "@superego/browser-app";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { FakeJavascriptSandbox } from "@superego/fake-javascript-sandbox/browser";
import { OpenAICompatInferenceServiceFactory } from "@superego/openai-compat-inference-service";
import { QueryClient } from "@tanstack/react-query";

const backend = new ExecutingBackend(
  new DemoDataRepositoriesManager(
    {
      appearance: { theme: Theme.Auto },
      inference: {
        completions: {
          provider: { baseUrl: null, apiKey: null },
          model: null,
        },
      },
      assistants: {
        developerPrompts: {
          [AssistantName.Factotum]: null,
          [AssistantName.CollectionManager]: null,
        },
      },
    },
    true,
  ),
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
