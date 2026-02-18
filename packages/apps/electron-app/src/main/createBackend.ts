import { join } from "node:path";
import { AssistantName, Theme } from "@superego/backend";
import {
  GoogleCalendar,
  GoogleContacts,
  StravaActivities,
} from "@superego/connectors";
import { NodejsSessionStorage } from "@superego/connectors/requirements/nodejs";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import { ExecutingBackend } from "@superego/executing-backend";
import { OpenAICompatInferenceServiceFactory } from "@superego/openai-compat-inference-service";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/nodejs";
import { SqliteDataRepositoriesManager } from "@superego/sqlite-data-repositories";
import { TscTypescriptCompiler } from "@superego/tsc-typescript-compiler";
import { app } from "electron";

interface CreateBackendOptions {
  ephemeral?: boolean;
}

export default function createBackend(
  port: number,
  options?: CreateBackendOptions,
) {
  const defaultGlobalSettings = {
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
  };

  const dataRepositoriesManager = options?.ephemeral
    ? new DemoDataRepositoriesManager(defaultGlobalSettings, "ephemeral", true)
    : (() => {
        const mgr = new SqliteDataRepositoriesManager({
          fileName: join(app.getPath("userData"), "superego.db"),
          defaultGlobalSettings,
        });
        mgr.runMigrations();
        return mgr;
      })();

  const connectors = options?.ephemeral
    ? []
    : (() => {
        const redirectUri = `http://localhost:${port}/OAuth2PKCECallback`;
        const sessionStorage = new NodejsSessionStorage();
        return [
          new GoogleCalendar(redirectUri, sessionStorage),
          new GoogleContacts(redirectUri, sessionStorage),
          new StravaActivities(redirectUri, sessionStorage),
        ];
      })();

  return new ExecutingBackend(
    dataRepositoriesManager,
    new QuickjsJavascriptSandbox(),
    new TscTypescriptCompiler(),
    new OpenAICompatInferenceServiceFactory(),
    connectors,
  );
}
