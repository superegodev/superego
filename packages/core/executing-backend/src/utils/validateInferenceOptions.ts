import type {
  InferenceOptions,
  InferenceOptionsNotValid,
  InferenceSettings,
} from "@superego/backend";
import type { ResultError } from "@superego/global-types";
import makeResultError from "../makers/makeResultError.js";

export default function validateInferenceOptions(
  inferenceOptions: InferenceOptions,
  inferenceSettings: InferenceSettings,
): ResultError<
  InferenceOptionsNotValid["name"],
  InferenceOptionsNotValid["details"]
> | null {
  const { providerModelRef } = inferenceOptions;

  const provider = inferenceSettings.providers.find(
    ({ name }) => name === providerModelRef.providerName,
  );
  if (!provider) {
    return makeResultError("InferenceOptionsNotValid", {
      providerModelRef,
    });
  }

  const model = provider.models.find(
    ({ id }) => id === providerModelRef.modelId,
  );
  if (!model) {
    return makeResultError("InferenceOptionsNotValid", {
      providerModelRef,
    });
  }

  return null;
}
