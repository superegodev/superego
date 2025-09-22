import type AppearanceSettings from "./AppearanceSettings.js";
import type AssistantsSettings from "./AssistantsSettings.js";
import type InferenceSettings from "./InferenceSettings.js";

export default interface GlobalSettings {
  inference: InferenceSettings;
  assistants: AssistantsSettings;
  appearance: AppearanceSettings;
}
