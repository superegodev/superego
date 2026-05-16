import type { ResultError } from "@superego/global-types";
import type ValidationIssue from "../types/ValidationIssue.js";

type ArgumentsNotValid = ResultError<
  "ArgumentsNotValid",
  {
    issues: ValidationIssue[];
  }
>;
export default ArgumentsNotValid;
