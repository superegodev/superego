import type InferenceModelId from "../ids/InferenceModelId.js";
import type InferenceModel from "./InferenceModel.js";
import type InferenceProvider from "./InferenceProvider.js";

export default interface InferenceSettings {
  providers: InferenceProvider[];
  models: InferenceModel[];
  defaultChatModel: InferenceModelId | null;
  defaultTranscriptionModel: InferenceModelId | null;
  defaultFileInspectionModel: InferenceModelId | null;
}
