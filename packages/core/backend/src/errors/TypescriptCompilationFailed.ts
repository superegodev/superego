import type { ResultError } from "@superego/global-types";

type TypescriptCompilationFailed = ResultError<
  "TypescriptCompilationFailed",
  | {
      reason: "TypeErrors";
      errors: {
        message: string;
        line?: number;
        character?: number;
      }[];
    }
  | {
      reason: "MissingOutput";
    }
>;
export default TypescriptCompilationFailed;
