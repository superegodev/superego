import type { ResultError } from "@superego/global-types";
import type AppId from "../ids/AppId.js";
import type AppVersionId from "../ids/AppVersionId.js";
import type ValidationIssue from "../types/ValidationIssue.js";

type AppStateMigrationRequired = ResultError<
  "AppStateMigrationRequired",
  {
    appId: AppId;
    previousSchemaId: AppVersionId;
    targetSchemaId: AppVersionId;
    issues: ValidationIssue[];
  }
>;
export default AppStateMigrationRequired;
