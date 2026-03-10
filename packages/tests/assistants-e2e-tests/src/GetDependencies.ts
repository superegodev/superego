import type { Backend, InferenceOptions } from "@superego/backend";
import type Evaluator from "./utils/Evaluator.js";

type GetDependencies = () => {
  backend: Backend;
  booleanOracle: Evaluator;
  inferenceOptions: InferenceOptions<"completion">;
};
export default GetDependencies;
