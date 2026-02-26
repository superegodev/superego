import type InferenceProvider from "./InferenceProvider.js";
import type InferenceProviderModelRef from "./InferenceProviderModelRef.js";

export default interface InferenceSettings {
  providers: InferenceProvider[];
  defaults: {
    completion: InferenceProviderModelRef | null;
    transcription: InferenceProviderModelRef | null;
    fileInspection: InferenceProviderModelRef | null;
  };
}
