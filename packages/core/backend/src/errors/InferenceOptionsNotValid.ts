import type { ResultError } from "@superego/global-types";
import type ValidationIssue from "../types/ValidationIssue.js";

type InferenceOptionsNotValid = ResultError<
  "InferenceOptionsNotValid",
  {
    issues: ValidationIssue[];
  }
>;
export default InferenceOptionsNotValid;
