import type { ResultError } from "@superego/global-types";
import type AppId from "../ids/AppId.js";
import type ValidationIssue from "../types/ValidationIssue.js";

type AppStateMigrationNotValid = ResultError<
  "AppStateMigrationNotValid",
  {
    appId: AppId;
    issues: ValidationIssue[];
  }
>;
export default AppStateMigrationNotValid;
