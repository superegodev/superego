import * as v from "valibot";
import InferenceOptionsSchema from "./InferenceOptions.js";
import InferenceProviderSchema from "./InferenceProvider.js";

const InferenceSettingsSchema = v.object({
  providers: v.array(InferenceProviderSchema),
  defaultInferenceOptions: InferenceOptionsSchema,
});
export default InferenceSettingsSchema;
export type InferenceSettings = v.InferOutput<typeof InferenceSettingsSchema>;
