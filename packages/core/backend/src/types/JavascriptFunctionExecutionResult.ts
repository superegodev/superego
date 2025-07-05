import type JavascriptFunctionExecutionError from "./JavascriptFunctionExecutionError.js";

type JavascriptFunctionExecutionResult =
  | { success: true; returnedValue: any }
  | { success: false; error: JavascriptFunctionExecutionError };
export default JavascriptFunctionExecutionResult;
