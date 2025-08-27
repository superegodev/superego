import type AppearanceSettings from "./AppearanceSettings.js";
import type AssistantSettings from "./AssistantSettings.js";

export default interface GlobalSettings {
  appearance: AppearanceSettings;
  // TODO: rename assistant setting
  assistant: AssistantSettings;
}
