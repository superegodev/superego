/// <reference types="vite/client" />
import "urlpattern-polyfill";
import { AssistantName, Theme } from "@superego/backend";
import { renderBrowserApp } from "@superego/browser-app";
import {
  GoogleCalendar,
  GoogleContacts,
  onOAuth2PKCEAuthorizationResponseUrl,
  StravaActivities,
} from "@superego/connectors";
import {
  BrowserBase64Url,
  BrowserSessionStorage,
} from "@superego/connectors/requirements/browser";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { FakeJavascriptSandbox } from "@superego/fake-javascript-sandbox/browser";
import { MonacoTypescriptCompiler } from "@superego/monaco-typescript-compiler";
import { OpenAICompatInferenceServiceFactory } from "@superego/openai-compat-inference-service";
import { QueryClient } from "@tanstack/react-query";

const isProduction = import.meta.env["VITE_DEPLOY_ENVIRONMENT"];
const redirectUri = isProduction
  ? "https://demo.superego.dev/OAuth2PKCECallback"
  : "http://localhost:5173/OAuth2PKCECallback";
const base64Url = new BrowserBase64Url();
const sessionStorage = new BrowserSessionStorage();
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
        // TODO: add demo API endpoint and configuration
        fileInspection: {
          provider: { baseUrl: null, apiKey: null },
          model: null,
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
        fileInspection: {
          provider: { baseUrl: null, apiKey: null },
          model: null,
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
  new MonacoTypescriptCompiler(async () => await import("monaco-editor")),
  new OpenAICompatInferenceServiceFactory(),
  [
    new GoogleCalendar(redirectUri, base64Url, sessionStorage),
    new GoogleContacts(redirectUri, base64Url, sessionStorage),
    new StravaActivities(redirectUri, base64Url, sessionStorage),
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
  renderBrowserApp(backend, queryClient, async () =>
    dataRepositoriesManager.loadData(
      (await import("./demoData/demoData.js")).default,
    ),
  );
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
