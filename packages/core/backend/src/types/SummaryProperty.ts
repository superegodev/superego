import type { I18nString } from "@superego/global-types";
import type JavascriptFunctionExecutionError from "./JavascriptFunctionExecutionError.js";

type SummaryProperty = {
  name: I18nString;
  description?: I18nString | undefined;
} & (
  | { value: string; valueComputationError: null }
  | { value: null; valueComputationError: JavascriptFunctionExecutionError }
);
export default SummaryProperty;
