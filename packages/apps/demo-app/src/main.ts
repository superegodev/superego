/// <reference types="vite/client" />
import { CompletionModel, Theme } from "@superego/backend";
import { renderBrowserApp } from "@superego/browser-app";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { FakeJavascriptSandbox } from "@superego/fake-javascript-sandbox/browser";
import { RoutingAssistantManager } from "@superego/routing-assistant-manager";
import { QueryClient } from "@tanstack/react-query";

const backend = new ExecutingBackend(
  new DemoDataRepositoriesManager({
    appearance: { theme: Theme.Auto },
    assistant: {
      providers: { groq: { apiKey: null, baseUrl: null } },
      completions: { defaultModel: CompletionModel.GroqKimiK2Instruct },
    },
  }),
  new FakeJavascriptSandbox(),
  new RoutingAssistantManager(),
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
