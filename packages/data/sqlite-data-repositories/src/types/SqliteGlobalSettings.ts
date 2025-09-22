import type { GlobalSettings } from "@superego/backend";
import type DeepPartial from "../utils/DeepPartial.js";

export default interface SqliteGlobalSettings {
  id: "singleton";
  /** JSON */
  value: string;
}

export function toEntity(
  settings: SqliteGlobalSettings,
): DeepPartial<GlobalSettings> {
  return JSON.parse(settings.value);
}
