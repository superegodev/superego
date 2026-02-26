import type { Backend, InferenceSettings } from "@superego/backend";
import type { Connector, InferenceService } from "@superego/executing-backend";

type GetDependencies = (overrides?: {
  connector?: Connector<any, any>;
  inferenceService?: InferenceService;
  inferenceSettings?: InferenceSettings;
}) => {
  backend: Backend;
};
export default GetDependencies;
