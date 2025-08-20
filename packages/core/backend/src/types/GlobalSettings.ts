import type AISettings from "./AISettings.js";
import type AppearanceSettings from "./AppearanceSettings.js";

export default interface GlobalSettings {
  appearance: AppearanceSettings;
  ai: AISettings;
}
