/// <reference types="vite/client" />
import "urlpattern-polyfill";
import { AssistantName, Theme } from "@superego/backend";
import { renderBrowserApp } from "@superego/browser-app";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { FakeJavascriptSandbox } from "@superego/fake-javascript-sandbox/browser";
import { OpenAICompatInferenceServiceFactory } from "@superego/openai-compat-inference-service";
import { QueryClient } from "@tanstack/react-query";

const isProduction = import.meta.env["VITE_DEPLOY_ENVIRONMENT"];
const dataRepositoriesManager = new DemoDataRepositoriesManager({
  appearance: { theme: Theme.Auto },
  inference: isProduction
    ? {
        chatCompletions: {
          provider: {
            baseUrl: `${window.location.origin}/api/openai/v1/chat/completions`,
            apiKey: null,
          },
          model: "openai/gpt-oss-120b",
        },
        transcriptions: {
          provider: {
            baseUrl: `${window.location.origin}/api/openai/v1/audio/transcriptions`,
            apiKey: null,
          },
          model: "whisper-large-v3-turbo",
        },
        speech: {
          provider: {
            baseUrl: `${window.location.origin}/api/openai/v1/audio/speech`,
            apiKey: null,
          },
          model: "gpt-4o-mini-tts",
          voice: "nova",
        },
      }
    : {
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

renderBrowserApp(backend, queryClient, async () =>
  dataRepositoriesManager.loadData(
    (await import("./demoData/demoData.js")).default,
  ),
);
