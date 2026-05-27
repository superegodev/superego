import type { Backend, InferenceSettings } from "@superego/backend";
import type { Config, InferenceService } from "@superego/executing-backend";

type GetDependencies = (overrides?: {
  inferenceService?: InferenceService;
  inferenceSettings?: InferenceSettings;
  config?: Partial<Config>;
}) => {
  backend: Backend;
};
export default GetDependencies;
