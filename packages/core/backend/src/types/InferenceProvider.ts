import type InferenceProviderDriver from "../enums/InferenceProviderDriver.js";
import type InferenceModel from "./InferenceModel.js";

export default interface InferenceProvider {
  name: string;
  baseUrl: string;
  apiKey: string | null;
  driver: InferenceProviderDriver;
  models: InferenceModel[];
}
