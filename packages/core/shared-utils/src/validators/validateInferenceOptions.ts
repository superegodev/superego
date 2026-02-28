import type {
  InferenceOptions,
  InferenceProviderModelRef,
  InferenceSettings,
  ValidationIssue,
} from "@superego/backend";

export default function validateInferenceOptions(
  inferenceOptions: InferenceOptions,
  inferenceSettings: InferenceSettings,
): ValidationIssue[] {
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

  return issues;
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
      path: [{ key: category }],
    });
  } else {
    const model = provider.models.find(
      ({ id }) => id === providerModelRef.modelId,
    );
    if (!model) {
      issues.push({
        message: `Model "${providerModelRef.modelId}" not found in provider "${providerModelRef.providerName}"`,
        path: [{ key: category }],
      });
    } else {
      if (
        category === "transcription" &&
        !model.capabilities.audioUnderstanding
      ) {
        issues.push({
          message: `Model "${model.id}" does not support audio understanding, required for transcription`,
          path: [{ key: category }],
        });
      }
      if (
        category === "fileInspection" &&
        !model.capabilities.audioUnderstanding &&
        !model.capabilities.imageUnderstanding &&
        !model.capabilities.pdfUnderstanding
      ) {
        issues.push({
          message: `Model "${model.id}" does not support any file understanding capability (audio, image, or PDF), required for file inspection`,
          path: [{ key: category }],
        });
      }
    }
  }
}
