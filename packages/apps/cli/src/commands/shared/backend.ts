import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { AssistantName, Theme } from "@superego/backend";
import { ExecutingBackend } from "@superego/executing-backend";
import { MultiDriverInferenceServiceFactory } from "@superego/multi-driver-inference-service";
import { TscTypescriptCompiler } from "@superego/tsc-typescript-compiler";

export async function createCliBackend(): Promise<ExecutingBackend> {
  const { QuickjsJavascriptSandbox } =
    await import("@superego/quickjs-javascript-sandbox/nodejs");
  const { SqliteDataRepositoriesManager } =
    await import("@superego/sqlite-data-repositories");
  const dataPath = getElectronUserDataPath();
  mkdirSync(dataPath, { recursive: true });
  const dataRepositoriesManager = new SqliteDataRepositoriesManager({
    fileName: join(dataPath, "superego.db"),
    defaultGlobalSettings: {
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
    },
  });
  dataRepositoriesManager.runMigrations();
  return new ExecutingBackend(
    dataRepositoriesManager,
    new QuickjsJavascriptSandbox(),
    new TscTypescriptCompiler(),
    new MultiDriverInferenceServiceFactory(),
    [],
  );
}

function getElectronUserDataPath(): string {
  switch (process.platform) {
    case "darwin":
      return join(homedir(), "Library", "Application Support", "superego");
    case "win32":
      return join(
        process.env["APPDATA"] ?? join(homedir(), "AppData", "Roaming"),
        "superego",
      );
    default:
      return join(
        process.env["XDG_CONFIG_HOME"] ?? join(homedir(), ".config"),
        "superego",
      );
  }
}
