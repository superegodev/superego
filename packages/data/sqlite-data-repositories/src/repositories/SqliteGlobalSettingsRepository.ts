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
        chatCompletions: {
          model:
            settings.inference?.chatCompletions?.model ??
            this.defaultGlobalSettings.inference.chatCompletions.model,
          provider: {
            apiKey:
              settings.inference?.chatCompletions?.provider?.apiKey ??
              this.defaultGlobalSettings.inference.chatCompletions.provider
                .apiKey,
            baseUrl:
              settings.inference?.chatCompletions?.provider?.baseUrl ??
              this.defaultGlobalSettings.inference.chatCompletions.provider
                .baseUrl,
          },
        },
        transcriptions: {
          model:
            settings.inference?.transcriptions?.model ??
            this.defaultGlobalSettings.inference.transcriptions.model,
          provider: {
            apiKey:
              settings.inference?.transcriptions?.provider?.apiKey ??
              this.defaultGlobalSettings.inference.transcriptions.provider
                .apiKey,
            baseUrl:
              settings.inference?.transcriptions?.provider?.baseUrl ??
              this.defaultGlobalSettings.inference.transcriptions.provider
                .baseUrl,
          },
        },
        speech: {
          model:
            settings.inference?.speech?.model ??
            this.defaultGlobalSettings.inference.speech.model,
          voice:
            settings.inference?.speech?.voice ??
            this.defaultGlobalSettings.inference.speech.voice,
          provider: {
            apiKey:
              settings.inference?.speech?.provider?.apiKey ??
              this.defaultGlobalSettings.inference.speech.provider.apiKey,
            baseUrl:
              settings.inference?.speech?.provider?.baseUrl ??
              this.defaultGlobalSettings.inference.speech.provider.baseUrl,
          },
        },
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
