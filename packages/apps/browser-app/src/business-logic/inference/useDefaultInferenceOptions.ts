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
  return (
    inferenceSettings.defaultInferenceOptions.completion ??
    wrapProviderModelRef(
      findFirstModel(inferenceSettings.providers, () => true),
    )
  );
}

function getDefaultTranscription(inferenceSettings: InferenceSettings) {
  return (
    inferenceSettings.defaultInferenceOptions.transcription ??
    wrapProviderModelRef(
      findFirstModel(
        inferenceSettings.providers,
        (model) => model.capabilities.audioUnderstanding,
      ),
    )
  );
}

function getDefaultFileInspection(inferenceSettings: InferenceSettings) {
  return (
    inferenceSettings.defaultInferenceOptions.fileInspection ??
    wrapProviderModelRef(
      findFirstModel(
        inferenceSettings.providers,
        (model) =>
          model.capabilities.pdfUnderstanding ||
          model.capabilities.imageUnderstanding ||
          model.capabilities.audioUnderstanding,
      ),
    )
  );
}

function wrapProviderModelRef(
  providerModelRef: InferenceProviderModelRef | null,
) {
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
