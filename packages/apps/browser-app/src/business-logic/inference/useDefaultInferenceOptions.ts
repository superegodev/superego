import type {
  InferenceModel,
  InferenceOptions,
  InferenceProvider,
  InferenceProviderModelRef,
  InferenceSettings,
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
  const completionRef =
    inferenceSettings.defaults.completion ??
    findFirstModel(inferenceSettings.providers, () => true);
  return completionRef ? { providerModelRef: completionRef } : null;
}

function getDefaultTranscription(inferenceSettings: InferenceSettings) {
  const transcriptionRef =
    inferenceSettings.defaults.transcription ??
    findFirstModel(
      inferenceSettings.providers,
      (model) => model.capabilities.audioUnderstanding,
    );
  return transcriptionRef ? { providerModelRef: transcriptionRef } : null;
}

function getDefaultFileInspection(inferenceSettings: InferenceSettings) {
  const fileInspectionRef =
    inferenceSettings.defaults.fileInspection ??
    findFirstModel(
      inferenceSettings.providers,
      (model) =>
        model.capabilities.pdfUnderstanding ||
        model.capabilities.imageUnderstanding ||
        model.capabilities.audioUnderstanding,
    );
  return fileInspectionRef ? { providerModelRef: fileInspectionRef } : null;
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
