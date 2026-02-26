/// <reference types="vite/client" />
import "urlpattern-polyfill";
import {
  AssistantName,
  InferenceProviderDriver,
  Theme,
} from "@superego/backend";
import { renderBrowserApp } from "@superego/browser-app";
import {
  GoogleCalendar,
  GoogleContacts,
  onOAuth2PKCEAuthorizationResponseUrl,
  StravaActivities,
} from "@superego/connectors";
import { BrowserSessionStorage } from "@superego/connectors/requirements/browser";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { FakeJavascriptSandbox } from "@superego/fake-javascript-sandbox/browser";
import { MonacoTypescriptCompiler } from "@superego/monaco-typescript-compiler";
import { MultiDriverInferenceServiceFactory } from "@superego/multi-driver-inference-service";
import { QueryClient } from "@tanstack/react-query";

const isProduction = import.meta.env["VITE_DEPLOY_ENVIRONMENT"];
const redirectUri = isProduction
  ? "https://demo.superego.dev/OAuth2PKCECallback"
  : "http://localhost:5173/OAuth2PKCECallback";
const sessionStorage = new BrowserSessionStorage();
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
              driver: InferenceProviderDriver.OpenRouter,
              models: [
                {
                  id: "openai/gpt-oss-120b",
                  name: "GPT OSS 120B",
                  capabilities: {
                    reasoning: true,
                    audioUnderstanding: false,
                    imageUnderstanding: false,
                    pdfUnderstanding: false,
                    webSearching: false,
                  },
                },
                {
                  id: "google/gemini-2.5-flash-lite",
                  name: "Gemini 2.5 Flash Lite",
                  capabilities: {
                    reasoning: true,
                    audioUnderstanding: true,
                    imageUnderstanding: true,
                    pdfUnderstanding: true,
                    webSearching: true,
                  },
                },
              ],
            },
          ],
          defaults: {
            completion: {
              providerName: "superego",
              modelId: "openai/gpt-oss-120b",
            },
            transcription: {
              providerName: "superego",
              modelId: "google/gemini-2.5-flash-lite",
            },
            fileInspection: {
              providerName: "superego",
              modelId: "google/gemini-2.5-flash-lite",
            },
          },
        }
      : {
          providers: [],
          defaults: {
            completion: null,
            transcription: null,
            fileInspection: null,
          },
        },
    assistants: {
      userName: null,
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
  new MonacoTypescriptCompiler(async () => await import("monaco-editor")),
  new MultiDriverInferenceServiceFactory(),
  [
    new GoogleCalendar(redirectUri, sessionStorage),
    new GoogleContacts(redirectUri, sessionStorage),
    new StravaActivities(redirectUri, sessionStorage),
  ],
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

if (window.location.href.startsWith(redirectUri)) {
  const result = await onOAuth2PKCEAuthorizationResponseUrl(
    backend,
    window.location.href,
  );
  if (result.success) {
    if (window.opener) {
      window.opener.postMessage({ type: "OAuth2PKCEFlowSucceeded" }, "*");
    }
    window.close();
  } else {
    console.error("authenticateOAuth2PKCEConnector failed", result.error);
    window.document.body.innerHTML = `<pre><code>${JSON.stringify(result.error, null, 2)}</code></pre>`;
  }
} else {
  renderBrowserApp(backend, queryClient, async (onProgress) => {
    const { default: loadDemoData } = await import(
      "./demoData/loadDemoData.js"
    );
    await loadDemoData(backend, onProgress);
  });
}

window.addEventListener("message", (evt) => {
  if (evt.data?.type === "OAuth2PKCEFlowSucceeded") {
    queryClient.invalidateQueries({ queryKey: ["listCollections"] });
  }
});

(window as any).backend = backend;
console.log(
  "Want to play with Superego from here? Use the global %cbackend%c object.",
  "font-weight:bold;",
  "color:inherit;",
  "Its API is here: https://github.com/superegodev/superego/blob/main/packages/core/backend/src/Backend.ts",
);
