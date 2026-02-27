import type {
  InferenceOptions,
  InferenceOptionsNotValid,
  InferenceProviderModelRef,
  InferenceSettings,
  ValidationIssue,
} from "@superego/backend";
import makeResultError from "../makers/makeResultError.js";
import isEmpty from "../utils/isEmpty.js";

export default function validateInferenceOptions(
  inferenceOptions: InferenceOptions,
  inferenceSettings: InferenceSettings,
): InferenceOptionsNotValid | null {
  const issues: ValidationIssue[] = [];

  if (inferenceOptions.completion) {
    validateProviderModelRef(
      inferenceOptions.completion.providerModelRef,
      inferenceSettings,
      "completion",
      issues,
    );
  }

  if (inferenceOptions.transcription) {
    validateProviderModelRef(
      inferenceOptions.transcription.providerModelRef,
      inferenceSettings,
      "transcription",
      issues,
    );
  }

  if (inferenceOptions.fileInspection) {
    validateProviderModelRef(
      inferenceOptions.fileInspection.providerModelRef,
      inferenceSettings,
      "fileInspection",
      issues,
    );
  }

  if (!isEmpty(issues)) {
    return makeResultError("InferenceOptionsNotValid", { issues });
  }

  return null;
}

function validateProviderModelRef(
  providerModelRef: InferenceProviderModelRef,
  inferenceSettings: InferenceSettings,
  category: string,
  issues: ValidationIssue[],
): void {
  const provider = inferenceSettings.providers.find(
    ({ name }) => name === providerModelRef.providerName,
  );
  if (!provider) {
    issues.push({
      message: `Provider "${providerModelRef.providerName}" not found`,
      path: [
        { key: category },
        { key: "providerModelRef" },
        { key: "providerName" },
      ],
    });
  } else {
    const model = provider.models.find(
      ({ id }) => id === providerModelRef.modelId,
    );
    if (!model) {
      issues.push({
        message: `Model "${providerModelRef.modelId}" not found in provider "${providerModelRef.providerName}"`,
        path: [
          { key: category },
          { key: "providerModelRef" },
          { key: "modelId" },
        ],
      });
    }
  }
}
