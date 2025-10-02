import { AssistantName, Theme } from "@superego/backend";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { OpenAICompatInferenceServiceFactory } from "@superego/openai-compat-inference-service";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/browser";
import { QueryClient } from "@tanstack/react-query";
import { renderBrowserApp } from "../src/index.js";

const backend = new ExecutingBackend(
  new DemoDataRepositoriesManager({
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
  }),
  new QuickjsJavascriptSandbox(),
  new OpenAICompatInferenceServiceFactory(),
  [],
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
