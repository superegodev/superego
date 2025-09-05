import { CompletionModel, Theme } from "@superego/backend";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { RoutingInferenceServiceFactory } from "@superego/inference-services";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/browser";
import { QueryClient } from "@tanstack/react-query";
import { renderBrowserApp } from "../src/index.js";

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
  new QuickjsJavascriptSandbox(),
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
