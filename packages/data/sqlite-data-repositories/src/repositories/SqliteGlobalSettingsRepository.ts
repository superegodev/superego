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
      inference: {
        providers: {
          groq: {
            apiKey:
              settings.inference?.providers?.groq?.apiKey ??
              this.defaultGlobalSettings.inference.providers.groq.apiKey,
          },
          openai: {
            apiKey:
              settings.inference?.providers?.openai?.apiKey ??
              this.defaultGlobalSettings.inference.providers.openai.apiKey,
          },
          google: {
            apiKey:
              settings.inference?.providers?.google?.apiKey ??
              this.defaultGlobalSettings.inference.providers.google.apiKey,
          },
          openrouter: {
            apiKey:
              settings.inference?.providers?.openrouter?.apiKey ??
              this.defaultGlobalSettings.inference.providers.openrouter.apiKey,
          },
        },
        completions: {
          model:
            settings.inference?.completions?.model ??
            this.defaultGlobalSettings.inference.completions.model,
        },
      },
    };
  }
}
