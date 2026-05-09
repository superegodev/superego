import * as v from "valibot";

const InferenceProviderModelRefSchema = v.object({
  providerName: v.string(),
  modelId: v.string(),
});
export default InferenceProviderModelRefSchema;
export type InferenceProviderModelRef = v.InferOutput<
  typeof InferenceProviderModelRefSchema
>;
