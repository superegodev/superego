import type AIAssistantSettings from "./AIAssistantSettings.js";
import type AppearanceSettings from "./AppearanceSettings.js";

export default interface GlobalSettings {
  appearance: AppearanceSettings;
  aiAssistant: AIAssistantSettings;
}
