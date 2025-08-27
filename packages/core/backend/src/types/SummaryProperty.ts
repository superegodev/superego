import type JavascriptFunctionExecutionError from "./JavascriptFunctionExecutionError.js";

type SummaryProperty = {
  name: string;
  description?: string | undefined;
} & (
  | { value: string; valueComputationError: null }
  | { value: null; valueComputationError: JavascriptFunctionExecutionError }
);
export default SummaryProperty;
