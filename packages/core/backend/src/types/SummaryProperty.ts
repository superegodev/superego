import type ExecutingJavascriptFunctionFailed from "../errors/ExecutingJavascriptFunctionFailed.js";

type SummaryProperty = {
  name: string;
} & (
  | { value: string; valueComputationError: null }
  | { value: null; valueComputationError: ExecutingJavascriptFunctionFailed }
);
export default SummaryProperty;
