import type { Backend, InferenceSettings } from "@superego/backend";
import type {
  Config,
  DataRepositoriesManager,
  HttpExecutor,
  InferenceService,
} from "@superego/executing-backend";

type GetDependencies = (overrides?: {
  inferenceService?: InferenceService;
  inferenceSettings?: InferenceSettings;
  config?: Partial<Config>;
  httpExecutor?: HttpExecutor;
}) => {
  backend: Backend;
  dataRepositoriesManager: DataRepositoriesManager;
};
export default GetDependencies;
