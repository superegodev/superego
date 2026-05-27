import { join } from "node:path";
import { AssistantName, Theme } from "@superego/backend";
import { ExecutingBackend } from "@superego/executing-backend";
import { MultiDriverInferenceServiceFactory } from "@superego/multi-driver-inference-service";
import { QuickjsTypescriptSandbox } from "@superego/quickjs-typescript-sandbox/nodejs";
import { SqliteDataRepositoriesManager } from "@superego/sqlite-data-repositories";
import { TscTypescriptCompiler } from "@superego/tsc-typescript-compiler";
import { app } from "electron";

export default function createBackend() {
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

  return new ExecutingBackend(
    dataRepositoriesManager,
    new QuickjsTypescriptSandbox(),
    new TscTypescriptCompiler(),
    new MultiDriverInferenceServiceFactory(),
  );
}
