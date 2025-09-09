import type { Backend } from "@superego/backend";
import type Evaluator from "./utils/Evaluator.js";

export default interface Dependencies {
  backend: Backend;
  booleanOracle: Evaluator;
}
