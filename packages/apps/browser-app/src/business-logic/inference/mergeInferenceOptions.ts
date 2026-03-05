import type { InferenceOptions } from "@superego/backend";

export default function mergeInferenceOptions(
  defaultInferenceOptions: InferenceOptions,
  customInferenceOptions: InferenceOptions | null,
): InferenceOptions {
  return {
    completion:
      customInferenceOptions?.completion ?? defaultInferenceOptions.completion,
    transcription:
      customInferenceOptions?.transcription ??
      defaultInferenceOptions.transcription,
    fileInspection:
      customInferenceOptions?.fileInspection ??
      defaultInferenceOptions.fileInspection,
  };
}
