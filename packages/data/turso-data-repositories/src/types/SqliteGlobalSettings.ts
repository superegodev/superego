import type { GlobalSettings } from "@superego/backend";
import type DeepPartial from "../utils/DeepPartial.js";

type SqliteGlobalSettings = {
  id: "singleton";
  /** JSON */
  value: string;
};
export default SqliteGlobalSettings;

export function toEntity(
  settings: SqliteGlobalSettings,
): DeepPartial<GlobalSettings> {
  return JSON.parse(settings.value);
}
