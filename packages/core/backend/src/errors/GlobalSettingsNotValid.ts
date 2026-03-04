import type { ResultError } from "@superego/global-types";
import type ValidationIssue from "../types/ValidationIssue.js";

type GlobalSettingsNotValid = ResultError<
  "GlobalSettingsNotValid",
  {
    issues: ValidationIssue[];
  }
>;
export default GlobalSettingsNotValid;
