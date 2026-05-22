import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { AssistantName, Theme } from "@superego/backend";
import { ExecutingBackend } from "@superego/executing-backend";
import { MultiDriverInferenceServiceFactory } from "@superego/multi-driver-inference-service";
import { TscTypescriptCompiler } from "@superego/tsc-typescript-compiler";

export async function createCliBackend(): Promise<ExecutingBackend> {
  const { QuickjsJavascriptSandbox } =
    await import("@superego/quickjs-javascript-sandbox/nodejs");
  const { SqliteDataRepositoriesManager } =
    await import("@superego/sqlite-data-repositories");
  const databaseFile = getDatabaseFile();
  mkdirSync(dirname(databaseFile), { recursive: true });
  const dataRepositoriesManager = new SqliteDataRepositoriesManager({
    fileName: databaseFile,
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

function getDatabaseFile(): string {
  const databaseFile = process.env["SUPEREGO_DATABASE_FILE"];
  if (databaseFile) {
    return resolve(databaseFile);
  }
  return join(getElectronUserDataPath(), "superego.db");
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
