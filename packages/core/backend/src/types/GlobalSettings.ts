import type AppearanceSettings from "./AppearanceSettings.js";
import type InferenceSettings from "./InferenceSettings.js";

export default interface GlobalSettings {
  appearance: AppearanceSettings;
  inference: InferenceSettings;
}
