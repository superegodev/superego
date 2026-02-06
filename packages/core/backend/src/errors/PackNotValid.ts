import type { ResultError } from "@superego/global-types";
import type ValidationIssue from "../types/ValidationIssue.js";

type PackNotValid = ResultError<
  "PackNotValid",
  {
    issues: ValidationIssue[];
  }
>;
export default PackNotValid;
