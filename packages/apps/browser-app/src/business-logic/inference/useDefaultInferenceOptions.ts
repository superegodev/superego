import {
  type InferenceModel,
  type InferenceOptions,
  type InferenceProvider,
  type InferenceProviderModelRef,
  type InferenceSettings,
  ReasoningEffort,
} from "@superego/backend";
import { useGlobalData } from "../backend/GlobalData.js";

export default function useDefaultInferenceOptions(): InferenceOptions {
  const { globalSettings } = useGlobalData();
  return {
    completion: getDefaultCompletion(globalSettings.inference),
    transcription: getDefaultTranscription(globalSettings.inference),
    fileInspection: getDefaultFileInspection(globalSettings.inference),
  };
}

function getDefaultCompletion(inferenceSettings: InferenceSettings) {
  if (inferenceSettings.defaultInferenceOptions.completion) {
    return inferenceSettings.defaultInferenceOptions.completion;
  }
  const providerModelRef = findFirstModel(
    inferenceSettings.providers,
    () => true,
  );
  return providerModelRef
    ? { providerModelRef, reasoningEffort: ReasoningEffort.Medium }
    : null;
}

function getDefaultTranscription(inferenceSettings: InferenceSettings) {
  if (inferenceSettings.defaultInferenceOptions.transcription) {
    return inferenceSettings.defaultInferenceOptions.transcription;
  }
  const providerModelRef = findFirstModel(
    inferenceSettings.providers,
    (model) => model.capabilities.audioUnderstanding,
  );
  return providerModelRef ? { providerModelRef } : null;
}

function getDefaultFileInspection(inferenceSettings: InferenceSettings) {
  if (inferenceSettings.defaultInferenceOptions.fileInspection) {
    return inferenceSettings.defaultInferenceOptions.fileInspection;
  }
  const providerModelRef = findFirstModel(
    inferenceSettings.providers,
    (model) =>
      model.capabilities.pdfUnderstanding ||
      model.capabilities.imageUnderstanding ||
      model.capabilities.audioUnderstanding,
  );
  return providerModelRef ? { providerModelRef } : null;
}

function findFirstModel(
  providers: InferenceProvider[],
  predicate: (model: InferenceModel) => boolean,
): InferenceProviderModelRef | null {
  for (const provider of providers) {
    for (const model of provider.models) {
      if (predicate(model)) {
        return { providerName: provider.name, modelId: model.id };
      }
    }
  }
  return null;
}
