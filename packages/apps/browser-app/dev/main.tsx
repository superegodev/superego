import { AssistantName, Theme } from "@superego/backend";
import { GoogleCalendarConnector } from "@superego/connectors";
import {
  BrowserBase64Url,
  BrowserSessionStorage,
} from "@superego/connectors/requirements/browser";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { OpenAICompatInferenceServiceFactory } from "@superego/openai-compat-inference-service";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/browser";
import { Id } from "@superego/shared-utils";
import { QueryClient } from "@tanstack/react-query";
import { RouteName } from "../src/business-logic/navigation/Route.js";
import { toHref } from "../src/business-logic/navigation/RouteUtils.js";
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
  [
    GoogleCalendarConnector({
      redirectUri: "TODO",
      base64Url: new BrowserBase64Url(),
      sessionStorage: new BrowserSessionStorage(),
    }),
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

if (window.location.pathname.startsWith("/oauth2-callback/")) {
  try {
    const stateParam = new URL(window.location.href).searchParams.get("state");
    if (!stateParam) {
      throw new Error("No state in search params");
    }
    const { collectionId } = JSON.parse(stateParam);
    if (!Id.is.collection(collectionId)) {
      throw new Error(
        `state.collectionId = "${collectionId}" is not a collection id`,
      );
    }
    const result = await backend.collections.authenticateOAuth2PKCEConnector(
      collectionId,
      window.location.href,
    );
    if (result.success) {
      window.history.replaceState(
        {},
        "",
        toHref({ name: RouteName.CollectionSettings, collectionId }),
      );
    } else {
      console.error("authenticateOAuth2PKCEConnector failed", result.error);
    }
  } catch (error) {
    console.error("Error processing OAuth2PKCE callback", error);
  }
}

renderBrowserApp(backend, queryClient);
