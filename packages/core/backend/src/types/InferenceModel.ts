import type InferenceModelId from "../ids/InferenceModelId.js";

export default interface InferenceModel {
  /** Must equal `${name}@${providerName}` */
  id: InferenceModelId;
  name: string;
  /** Must exist in InferenceSettings.providers. */
  providerName: string;
  capabilities: {
    reasoning: boolean;
    audioUnderstanding: boolean;
    imageUnderstanding: boolean;
    pdfUnderstanding: boolean;
    webSearching: boolean;
  };
}
