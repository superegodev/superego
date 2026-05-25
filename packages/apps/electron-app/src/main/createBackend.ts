import { join } from "node:path";
import { AssistantName, Theme } from "@superego/backend";
import {
  GoogleCalendar,
  GoogleContacts,
  StravaActivities,
} from "@superego/connectors";
import { NodejsSessionStorage } from "@superego/connectors/requirements/nodejs";
import { ExecutingBackend } from "@superego/executing-backend";
import { MultiDriverInferenceServiceFactory } from "@superego/multi-driver-inference-service";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/nodejs";
import { SqliteDataRepositoriesManager } from "@superego/sqlite-data-repositories";
import { TscTypescriptCompiler } from "@superego/tsc-typescript-compiler";
import { app } from "electron";

export default function createBackend(port: number) {
  const defaultGlobalSettings = {
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
  };

  const dataRepositoriesManager = new SqliteDataRepositoriesManager({
    fileName: join(app.getPath("userData"), "superego.db"),
    defaultGlobalSettings,
  });
  dataRepositoriesManager.runMigrations();

  const redirectUri = `http://localhost:${port}/OAuth2PKCECallback`;
  const sessionStorage = new NodejsSessionStorage();
  const connectors = [
    new GoogleCalendar(redirectUri, sessionStorage),
    new GoogleContacts(redirectUri, sessionStorage),
    new StravaActivities(redirectUri, sessionStorage),
  ];

  return new ExecutingBackend(
    dataRepositoriesManager,
    new QuickjsJavascriptSandbox(),
    new TscTypescriptCompiler(),
    new MultiDriverInferenceServiceFactory(),
    connectors,
  );
}
