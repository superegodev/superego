/// <reference types="vite/client" />
import "urlpattern-polyfill";
import {
  AssistantName,
  InferenceProviderDriver,
  ReasoningEffort,
  Theme,
} from "@superego/backend";
import { renderBrowserApp } from "@superego/browser-app";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { FakeJavascriptSandbox } from "@superego/fake-javascript-sandbox/browser";
import { MonacoTypescriptCompiler } from "@superego/monaco-typescript-compiler";
import { MultiDriverInferenceServiceFactory } from "@superego/multi-driver-inference-service";
import { QueryClient } from "@tanstack/react-query";
import loadDemoData from "./demoData/loadDemoData.js";

const isProduction = import.meta.env["VITE_DEPLOY_ENVIRONMENT"];
const commitSha = import.meta.env["VITE_COMMIT_SHA"]?.slice(0, 7);
const databaseName = commitSha ? `superego-${commitSha}` : "superego";
const dataRepositoriesManager = new DemoDataRepositoriesManager(
  {
    appearance: { theme: Theme.Auto },
    inference: isProduction
      ? {
          providers: [
            {
              name: "superego",
              baseUrl: `${window.location.origin}/api/v1/responses`,
              apiKey: null,
              driver: InferenceProviderDriver.OpenResponses,
              models: [
                {
                  id: "google/gemini-3.1-flash-lite",
                  name: "Gemini 3 Flash Lite",
                  capabilities: {
                    audioUnderstanding: true,
                    imageUnderstanding: true,
                    pdfUnderstanding: true,
                  },
                },
              ],
            },
          ],
          defaultInferenceOptions: {
            completion: {
              providerModelRef: {
                providerName: "superego",
                modelId: "google/gemini-3.1-flash-lite",
              },
              reasoningEffort: ReasoningEffort.Medium,
            },
            transcription: {
              providerModelRef: {
                providerName: "superego",
                modelId: "google/gemini-3.1-flash-lite",
              },
            },
            fileInspection: {
              providerModelRef: {
                providerName: "superego",
                modelId: "google/gemini-3.1-flash-lite",
              },
            },
          },
        }
      : {
          providers: [],
          defaultInferenceOptions: {
            completion: null,
            transcription: null,
            fileInspection: null,
          },
        },
    assistants: {
      userInfo: "Name: Alex. Born: 1990-09-01",
      userPreferences: null,
      developerPrompts: {
        [AssistantName.Factotum]: null,
        [AssistantName.CollectionCreator]: null,
      },
    },
  },
  databaseName,
);
const backend = new ExecutingBackend(
  dataRepositoriesManager,
  new FakeJavascriptSandbox(),
  new MonacoTypescriptCompiler(
    async () => (await import("@superego/browser-app/monaco")).default,
  ),
  new MultiDriverInferenceServiceFactory(),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      networkMode: "always",
      refetchOnWindowFocus: false,
    },
    mutations: {
      networkMode: "always",
    },
  },
});

const collectionsResult = await backend.collections.list();
if (collectionsResult.success && collectionsResult.data.length === 0) {
  await loadDemoData(backend);
}
renderBrowserApp(backend, queryClient);

(window as any).backend = backend;
console.log(
  "Want to play with Superego from here? Use the global %cbackend%c object.",
  "font-weight:bold;",
  "color:inherit;",
  "Its API is here: https://github.com/superegodev/superego/blob/main/packages/core/backend/src/Backend.ts",
);
