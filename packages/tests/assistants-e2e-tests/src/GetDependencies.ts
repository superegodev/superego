import type { Backend, InferenceOptionsCompletion } from "@superego/backend";
import type Evaluator from "./utils/Evaluator.js";

type GetDependencies = () => {
  backend: Backend;
  booleanOracle: Evaluator;
  inferenceOptions: InferenceOptionsCompletion;
};
export default GetDependencies;
