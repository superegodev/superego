import { join } from "node:path";
import { AssistantName, Theme } from "@superego/backend";
import {
  GoogleCalendar,
  GoogleContacts,
  StravaActivities,
} from "@superego/connectors";
import { NodejsSessionStorage } from "@superego/connectors/requirements/nodejs";
import { ExecutingBackend } from "@superego/executing-backend";
import { OpenAICompatInferenceServiceFactory } from "@superego/openai-compat-inference-service";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/nodejs";
import { SqliteDataRepositoriesManager } from "@superego/sqlite-data-repositories";
import { TscTypescriptCompiler } from "@superego/tsc-typescript-compiler";
import { app } from "electron";

export default function createBackend(port: number) {
  const redirectUri = `http://localhost:${port}/OAuth2PKCECallback`;
  const sessionStorage = new NodejsSessionStorage();
  const dataRepositoriesManager = new SqliteDataRepositoriesManager({
    fileName: join(app.getPath("userData"), "superego.db"),
    defaultGlobalSettings: {
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
    },
  });
  dataRepositoriesManager.runMigrations();
  const javascriptSandbox = new QuickjsJavascriptSandbox();
  const typescriptCompiler = new TscTypescriptCompiler();
  const inferenceServiceFactory = new OpenAICompatInferenceServiceFactory();
  return new ExecutingBackend(
    dataRepositoriesManager,
    javascriptSandbox,
    typescriptCompiler,
    inferenceServiceFactory,
    [
      new GoogleCalendar(redirectUri, sessionStorage),
      new GoogleContacts(redirectUri, sessionStorage),
      new StravaActivities(redirectUri, sessionStorage),
    ],
  );
}
