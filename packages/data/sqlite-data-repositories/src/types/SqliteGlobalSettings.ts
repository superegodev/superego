import type { GlobalSettings } from "@superego/backend";

export default interface SqliteGlobalSettings {
  id: "singleton";
  /** JSON */
  value: string;
}

export function toEntity(settings: SqliteGlobalSettings): GlobalSettings {
  return JSON.parse(settings.value);
}
