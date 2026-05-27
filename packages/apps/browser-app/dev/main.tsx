import { AssistantName, Theme } from "@superego/backend";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { MonacoTypescriptCompiler } from "@superego/monaco-typescript-compiler";
import { MultiDriverInferenceServiceFactory } from "@superego/multi-driver-inference-service";
import { QuickjsTypescriptSandbox } from "@superego/quickjs-typescript-sandbox/browser";
import { QueryClient } from "@tanstack/react-query";
import { renderBrowserApp } from "../src/index.js";
import monaco from "../src/monaco.js";

const backend = new ExecutingBackend(
  new DemoDataRepositoriesManager({
    appearance: { theme: Theme.Auto },
    inference: {
      providers: [],
      defaultInferenceOptions: {
        completion: null,
        transcription: null,
        fileInspection: null,
      },
    },
    assistants: {
      userInfo: null,
      userPreferences: null,
      developerPrompts: {
        [AssistantName.Factotum]: null,
        [AssistantName.CollectionCreator]: null,
      },
    },
  }),
  new QuickjsTypescriptSandbox(),
  new MonacoTypescriptCompiler(
    async () => (await import("../src/monaco.js")).default,
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

renderBrowserApp(backend, queryClient);

(window as any).backend = backend;
(window as any).monaco = monaco;
