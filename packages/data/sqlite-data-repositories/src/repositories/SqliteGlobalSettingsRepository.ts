import type { DatabaseSync } from "node:sqlite";
import type { GlobalSettings } from "@superego/backend";
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
      assistant: {
        completions: {
          model:
            settings.assistant?.completions?.model ??
            this.defaultGlobalSettings.assistant.completions.model,
          provider: {
            apiKey:
              settings.assistant?.completions?.provider?.apiKey ??
              this.defaultGlobalSettings.assistant.completions.provider.apiKey,
            baseUrl:
              settings.assistant?.completions?.provider?.baseUrl ??
              this.defaultGlobalSettings.assistant.completions.provider.baseUrl,
          },
        },
        developerPrompt:
          settings.assistant?.developerPrompt ??
          this.defaultGlobalSettings.assistant.developerPrompt,
      },
    };
  }
}
