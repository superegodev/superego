import type InferenceProviderModelRef from "./InferenceProviderModelRef.js";

type WithNonNullableProp<Type, NonNullableProp extends keyof Type> = {
  [P in keyof Type]: P extends NonNullableProp ? Type[P] : Type[P] | null;
};

type NonNullableInferenceOptions = {
  completion: {
    providerModelRef: InferenceProviderModelRef;
  };
  transcription: {
    providerModelRef: InferenceProviderModelRef;
  };
  fileInspection: {
    providerModelRef: InferenceProviderModelRef;
  };
};

/**
 * Inference options for each capability (completion, transcription,
 * fileInspection). By default every property is nullable. Pass capability names
 * as the `Prop` type parameter to mark them as non-nullable, e.g.
 * `InferenceOptions<"completion">` guarantees `completion` is non-null.
 */
type InferenceOptions<Prop extends keyof NonNullableInferenceOptions = never> =
  WithNonNullableProp<NonNullableInferenceOptions, Prop>;
export default InferenceOptions;
