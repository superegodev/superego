import type { InferenceOptions } from "@superego/backend";

interface IsInferenceConfigured {
  completion: boolean;
  transcription: boolean;
  fileInspection: boolean;
}
export default function getIsInferenceConfigured(
  inferenceOptions: InferenceOptions,
): IsInferenceConfigured {
  return {
    completion: inferenceOptions.completion !== null,
    transcription: inferenceOptions.transcription !== null,
    fileInspection: inferenceOptions.fileInspection !== null,
  };
}
