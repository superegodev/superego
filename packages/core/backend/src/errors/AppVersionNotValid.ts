import type { ResultError } from "@superego/global-types";
import type AppId from "../ids/AppId.js";
import type AppVersionId from "../ids/AppVersionId.js";
import type ValidationIssue from "../types/ValidationIssue.js";

type AppVersionNotValid = ResultError<
  "AppVersionNotValid",
  {
    appId: AppId | null;
    appVersionId: AppVersionId | null;
    issues: ValidationIssue[];
  }
>;
export default AppVersionNotValid;
