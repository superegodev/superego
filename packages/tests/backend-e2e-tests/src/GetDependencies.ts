import type { Backend, InferenceSettings } from "@superego/backend";
import type {
  Config,
  DataRepositoriesManager,
  InferenceService,
} from "@superego/executing-backend";

type GetDependencies = (overrides?: {
  inferenceService?: InferenceService;
  inferenceSettings?: InferenceSettings;
  config?: Partial<Config>;
}) => {
  backend: Backend;
  dataRepositoriesManager: DataRepositoriesManager;
};
export default GetDependencies;
