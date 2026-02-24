import type {
  InferenceOptions,
  InferenceOptionsNotValid,
  InferenceSettings,
  ValidationIssue,
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
  const issues: ValidationIssue[] = [];
  const { providerModelRef } = inferenceOptions;

  const provider = inferenceSettings.providers.find(
    ({ name }) => name === providerModelRef.providerName,
  );
  if (!provider) {
    issues.push({
      message: `Provider "${providerModelRef.providerName}" not found`,
      path: [{ key: "providerModelRef" }, { key: "providerName" }],
    });
  } else {
    const model = provider.models.find(
      ({ id }) => id === providerModelRef.modelId,
    );
    if (!model) {
      issues.push({
        message: `Model "${providerModelRef.modelId}" not found in provider "${providerModelRef.providerName}"`,
        path: [{ key: "providerModelRef" }, { key: "modelId" }],
      });
    }
  }

  if (issues.length > 0) {
    return makeResultError("InferenceOptionsNotValid", { issues });
  }

  return null;
}
