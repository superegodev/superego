import type { ResultError } from "@superego/global-types";
import type AppId from "../ids/AppId.js";
import type AppVersionId from "../ids/AppVersionId.js";
import type ValidationIssue from "../types/ValidationIssue.js";

type AppStateContentNotValid = ResultError<
  "AppStateContentNotValid",
  {
    appId: AppId | null;
    schemaId: AppVersionId;
    issues: ValidationIssue[];
  }
>;
export default AppStateContentNotValid;
