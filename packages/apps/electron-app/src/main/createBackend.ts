import { join } from "node:path";
import { AssistantName, Theme } from "@superego/backend";
import {
  GoogleCalendar,
  GoogleContacts,
  StravaActivities,
} from "@superego/connectors";
import { NodejsSessionStorage } from "@superego/connectors/requirements/nodejs";
import { DemoDataRepositoriesManager } from "@superego/demo-data-repositories";
import {
  type Connector,
  type DataRepositoriesManager,
  ExecutingBackend,
} from "@superego/executing-backend";
import { OpenAICompatInferenceServiceFactory } from "@superego/openai-compat-inference-service";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/nodejs";
import { SqliteDataRepositoriesManager } from "@superego/sqlite-data-repositories";
import { TscTypescriptCompiler } from "@superego/tsc-typescript-compiler";
import { app } from "electron";

export default function createBackend(port: number, isDevenv: boolean) {
  const defaultGlobalSettings = {
    appearance: { theme: Theme.Auto },
    inference: {
      chatCompletions: {
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

  let dataRepositoriesManager: DataRepositoriesManager;
  if (isDevenv) {
    dataRepositoriesManager = new DemoDataRepositoriesManager(
      defaultGlobalSettings,
      undefined,
      true,
    );
  } else {
    const sqliteDataRepositoriesManager = new SqliteDataRepositoriesManager({
      fileName: join(app.getPath("userData"), "superego.db"),
      defaultGlobalSettings,
    });
    sqliteDataRepositoriesManager.runMigrations();
    dataRepositoriesManager = sqliteDataRepositoriesManager;
  }

  let connectors: Connector<any, any>[];
  if (isDevenv) {
    connectors = [];
  } else {
    const redirectUri = `http://localhost:${port}/OAuth2PKCECallback`;
    const sessionStorage = new NodejsSessionStorage();
    connectors = [
      new GoogleCalendar(redirectUri, sessionStorage),
      new GoogleContacts(redirectUri, sessionStorage),
      new StravaActivities(redirectUri, sessionStorage),
    ];
  }

  return new ExecutingBackend(
    dataRepositoriesManager,
    new QuickjsJavascriptSandbox(),
    new TscTypescriptCompiler(),
    new OpenAICompatInferenceServiceFactory(),
    connectors,
  );
}
