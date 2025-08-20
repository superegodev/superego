import { AICompletionModel, Theme } from "@superego/backend";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/browser";
import { QueryClient } from "@tanstack/react-query";
import { renderBrowserApp } from "../src/index.js";

const backend = new ExecutingBackend(
  new DemoDataRepositoriesManager({
    appearance: { theme: Theme.Auto },
    ai: {
      providers: { groq: { apiKey: null, baseUrl: null } },
      completions: { defaultModel: AICompletionModel.GroqKimiK2Instruct },
    },
  }),
  new QuickjsJavascriptSandbox(),
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
