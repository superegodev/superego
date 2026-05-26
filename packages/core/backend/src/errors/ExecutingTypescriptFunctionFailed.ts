import type { ResultError } from "@superego/global-types";

type ExecutingTypescriptFunctionFailed = ResultError<
  "ExecutingTypescriptFunctionFailed",
  {
    message: string;
    name?: string | undefined;
    stack?: string | undefined;
  }
>;
export default ExecutingTypescriptFunctionFailed;
