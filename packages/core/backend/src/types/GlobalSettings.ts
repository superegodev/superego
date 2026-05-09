import * as v from "valibot";
import AppearanceSettingsSchema from "./AppearanceSettings.js";
import AssistantsSettingsSchema from "./AssistantsSettings.js";
import InferenceSettingsSchema from "./InferenceSettings.js";

const GlobalSettingsSchema = v.object({
  inference: InferenceSettingsSchema,
  assistants: AssistantsSettingsSchema,
  appearance: AppearanceSettingsSchema,
});
export default GlobalSettingsSchema;
export type GlobalSettings = v.InferOutput<typeof GlobalSettingsSchema>;
