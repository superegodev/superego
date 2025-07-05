import type { GlobalSettings } from "@superego/backend";

export default interface GlobalSettingsRepository {
  replace(globalSettings: GlobalSettings): Promise<void>;
  get(): Promise<GlobalSettings>;
}
