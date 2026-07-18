import type { GlobalSettings } from "@superego/backend";
import type DeepPartial from "../utils/DeepPartial.js";

type TursoGlobalSettings = {
  id: "singleton";
  /** JSON */
  value: string;
};
export default TursoGlobalSettings;

export function toEntity(
  settings: TursoGlobalSettings,
): DeepPartial<GlobalSettings> {
  return JSON.parse(settings.value);
}
