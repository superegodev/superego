import type { DatabaseSync } from "node:sqlite";
import { AssistantName, type GlobalSettings } from "@superego/backend";
import type { GlobalSettingsRepository } from "@superego/executing-backend";
import type SqliteGlobalSettings from "../types/SqliteGlobalSettings.js";
import { toEntity } from "../types/SqliteGlobalSettings.js";
import type DeepPartial from "../utils/DeepPartial.js";

const table = "singleton__global_settings";

export default class SqliteGlobalSettingsRepository
  implements GlobalSettingsRepository
{
  constructor(
    private db: DatabaseSync,
    private defaultGlobalSettings: GlobalSettings,
  ) {}

  async replace(globalSettings: GlobalSettings): Promise<void> {
    this.db
      .prepare(`
        INSERT OR REPLACE INTO "${table}"
          ("id", "value")
        VALUES
          (?, ?)
      `)
      .run("singleton", JSON.stringify(globalSettings));
  }

  async get(): Promise<GlobalSettings> {
    const settings = this.db
      .prepare(`SELECT * FROM "${table}" WHERE "id" = ?`)
      .get("singleton") as SqliteGlobalSettings | undefined;
    return this.mergeDefaults(settings ? toEntity(settings) : {});
  }

  // The settings retrieved from SQLite could be either missing, or they could
  // have been saved by a previous version of Superego and been missing some
  // properties. This function merges them with the default settings, ensuring
  // that the returned object respects the GlobalSettings interface.
  private mergeDefaults(settings: DeepPartial<GlobalSettings>): GlobalSettings {
    return {
      appearance: {
        theme:
          settings?.appearance?.theme ??
          this.defaultGlobalSettings.appearance.theme,
      },
      inference: {
        providers:
          (settings.inference
            ?.providers as GlobalSettings["inference"]["providers"]) ??
          this.defaultGlobalSettings.inference.providers,
        models:
          (settings.inference
            ?.models as GlobalSettings["inference"]["models"]) ??
          this.defaultGlobalSettings.inference.models,
        defaultChatModel:
          settings.inference?.defaultChatModel ??
          this.defaultGlobalSettings.inference.defaultChatModel,
        defaultTranscriptionModel:
          settings.inference?.defaultTranscriptionModel ??
          this.defaultGlobalSettings.inference.defaultTranscriptionModel,
        defaultFileInspectionModel:
          settings.inference?.defaultFileInspectionModel ??
          this.defaultGlobalSettings.inference.defaultFileInspectionModel,
      },
      assistants: {
        userName:
          settings.assistants?.userName ??
          this.defaultGlobalSettings.assistants.userName,
        developerPrompts: {
          [AssistantName.CollectionCreator]:
            settings.assistants?.developerPrompts?.[
              AssistantName.CollectionCreator
            ] ??
            this.defaultGlobalSettings.assistants.developerPrompts[
              AssistantName.CollectionCreator
            ],
          [AssistantName.Factotum]:
            settings.assistants?.developerPrompts?.[AssistantName.Factotum] ??
            this.defaultGlobalSettings.assistants.developerPrompts[
              AssistantName.Factotum
            ],
        },
      },
    };
  }
}
