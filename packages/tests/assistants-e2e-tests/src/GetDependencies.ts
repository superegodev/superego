import type { Backend } from "@superego/backend";
import type Evaluator from "./utils/Evaluator.js";

type GetDependencies = () => {
  backend: Backend;
  booleanOracle: Evaluator;
};
export default GetDependencies;
