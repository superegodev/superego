import {
  AssistantName,
  CompletionModel,
  type Conversation,
  ConversationFormat,
  type Message,
  MessageContentPartType,
  Theme,
} from "@superego/backend";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { RoutingInferenceServiceFactory } from "@superego/inference-services";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/browser";
import { QueryClient } from "@tanstack/react-query";
import { renderBrowserApp } from "../src/index.js";

const backend = new ExecutingBackend(
  new DemoDataRepositoriesManager({
    appearance: { theme: Theme.Auto },
    inference: {
      providers: { groq: { apiKey: null, baseUrl: null } },
      completions: { defaultModel: CompletionModel.GroqKimiK2Instruct },
    },
  }),
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
