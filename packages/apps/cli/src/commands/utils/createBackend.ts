import { AssistantName, type Backend, Theme } from "@superego/backend";
import {
  ExecutingBackend,
  type InferenceServiceFactory,
} from "@superego/executing-backend";
import { QuickjsJavascriptSandbox } from "@superego/quickjs-javascript-sandbox/nodejs";
import { SqliteDataRepositoriesManager } from "@superego/sqlite-data-repositories";
import { TscTypescriptCompiler } from "@superego/tsc-typescript-compiler";
import getAppDatabasePath from "./getAppDatabasePath.js";

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

const noopInferenceServiceFactory: InferenceServiceFactory = {
  create() {
    throw new Error("Inference is not available in the CLI");
  },
};

export default function createBackend(): Backend {
  const dataRepositoriesManager = new SqliteDataRepositoriesManager({
    fileName: getAppDatabasePath(),
    defaultGlobalSettings,
  });
  dataRepositoriesManager.runMigrations();

  return new ExecutingBackend(
    dataRepositoriesManager,
    new QuickjsJavascriptSandbox(),
    new TscTypescriptCompiler(),
    noopInferenceServiceFactory,
    [],
  );
}
