import type { InferenceOptions, InferenceSettings } from "@superego/backend";

// TODO_AI:
// - merge this with function that returns what's configured
// - idea: what if inferenceOptions also contains the transcription and
//   fileInspection models?
export default function getDefaultInferenceOptions(
  inference: InferenceSettings,
): InferenceOptions | null {
  return inference.defaults.completion
    ? { providerModelRef: inference.defaults.completion }
    : null;
}
