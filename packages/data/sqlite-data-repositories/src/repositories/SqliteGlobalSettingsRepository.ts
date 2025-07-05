import type { DatabaseSync } from "node:sqlite";
import type { GlobalSettings } from "@superego/backend";
import type { GlobalSettingsRepository } from "@superego/executing-backend";
import type SqliteGlobalSettings from "../types/SqliteGlobalSettings.js";
import { toEntity } from "../types/SqliteGlobalSettings.js";

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
    return settings ? toEntity(settings) : this.defaultGlobalSettings;
  }
}
