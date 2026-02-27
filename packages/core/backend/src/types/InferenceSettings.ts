import type InferenceOptions from "./InferenceOptions.js";
import type InferenceProvider from "./InferenceProvider.js";

export default interface InferenceSettings {
  providers: InferenceProvider[];
  defaultInferenceOptions: InferenceOptions;
}
