import type { ResultError } from "@superego/global-types";
import type AppId from "../ids/AppId.js";
import type ValidationIssue from "../types/ValidationIssue.js";

type AppStateMigrationRequired = ResultError<
  "AppStateMigrationRequired",
  {
    appId: AppId;
    issues: ValidationIssue[];
  }
>;
export default AppStateMigrationRequired;
