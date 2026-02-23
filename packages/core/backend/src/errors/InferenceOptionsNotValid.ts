import type { ResultError } from "@superego/global-types";
import type InferenceProviderModelRef from "../types/InferenceProviderModelRef.js";

type InferenceOptionsNotValid = ResultError<
  "InferenceOptionsNotValid",
  {
    providerModelRef: InferenceProviderModelRef;
  }
>;
export default InferenceOptionsNotValid;
