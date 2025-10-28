import type { ResultError } from "@superego/global-types";

type TypescriptCompilationFailed = ResultError<
  "TypescriptCompilationFailed",
  | {
      reason: "TypeErrors";
      errors: string;
    }
  | {
      reason: "MissingOutput";
    }
>;
export default TypescriptCompilationFailed;
