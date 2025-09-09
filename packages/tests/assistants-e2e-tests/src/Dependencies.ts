import type { Backend } from "@superego/backend";
import type BooleanOracle from "./utils/BooleanOracle.js";

export default interface Dependencies {
  backend: Backend;
  booleanOracle: BooleanOracle;
}
