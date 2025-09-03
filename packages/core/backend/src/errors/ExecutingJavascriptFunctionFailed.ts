import type { ResultError } from "@superego/global-types";

type ExecutingJavascriptFunctionFailed = ResultError<
  "ExecutingJavascriptFunctionFailed",
  {
    message: string;
    name?: string | undefined;
    stack?: string | undefined;
  }
>;
export default ExecutingJavascriptFunctionFailed;
