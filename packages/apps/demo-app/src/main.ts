/// <reference types="vite/client" />
import { CompletionModel, Theme } from "@superego/backend";
import { renderBrowserApp } from "@superego/browser-app";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { FakeJavascriptSandbox } from "@superego/fake-javascript-sandbox/browser";
import { RoutingInferenceServiceFactory } from "@superego/inference-services";
import { QueryClient } from "@tanstack/react-query";

const backend = new ExecutingBackend(
  new DemoDataRepositoriesManager(
    {
      appearance: { theme: Theme.Auto },
      inference: {
        providers: {
          groq: { apiKey: null },
          openai: { apiKey: null },
          google: { apiKey: null },
          openrouter: { apiKey: null },
        },
        completions: { model: CompletionModel.GroqKimiK2Instruct0905 },
      },
    },
    true,
  ),
  new FakeJavascriptSandbox(),
  new RoutingInferenceServiceFactory(),
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
