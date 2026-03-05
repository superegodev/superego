import type { Backend, InferenceSettings } from "@superego/backend";
import type {
  Config,
  Connector,
  InferenceService,
} from "@superego/executing-backend";

type GetDependencies = (overrides?: {
  connector?: Connector<any, any>;
  inferenceService?: InferenceService;
  inferenceSettings?: InferenceSettings;
  config?: Partial<Config>;
}) => {
  backend: Backend;
};
export default GetDependencies;
