import type InferenceProviderDriver from "../enums/InferenceProviderDriver.js";

export default interface InferenceProvider {
  name: string;
  baseUrl: string;
  apiKey: string | null;
  driver: InferenceProviderDriver;
}
