import { AssistantName, Theme } from "@superego/backend";
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
import { MonacoTypescriptCompiler } from "@superego/monaco-typescript-compiler";
import { OpenAICompatInferenceServiceFactory } from "@superego/openai-compat-inference-service";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/browser";
import { QueryClient } from "@tanstack/react-query";
import { renderBrowserApp } from "../src/index.js";

const redirectUri = "http://localhost:5173/OAuth2PKCECallback";
const base64Url = new BrowserBase64Url();
const sessionStorage = new BrowserSessionStorage();
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
  new MonacoTypescriptCompiler(
    async () => (await import("../src/monaco.js")).default,
  ),
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
  renderBrowserApp(backend, queryClient);
}

window.addEventListener("message", (evt) => {
  if (evt.data?.type === "OAuth2PKCEFlowSucceeded") {
    queryClient.invalidateQueries({ queryKey: ["listCollections"] });
  }
});
