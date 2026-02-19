import type { ResultError } from "@superego/global-types";
import type ValidationIssue from "../types/ValidationIssue.js";

type InputNotValid = ResultError<
  "InputNotValid",
  {
    issues: ValidationIssue[];
  }
>;
export default InputNotValid;
