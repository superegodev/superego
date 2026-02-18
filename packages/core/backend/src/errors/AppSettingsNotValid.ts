import type { ResultError } from "@superego/global-types";
import type AppId from "../ids/AppId.js";
import type ValidationIssue from "../types/ValidationIssue.js";

type AppSettingsNotValid = ResultError<
  "AppSettingsNotValid",
  {
    appId: AppId | null;
    issues: ValidationIssue[];
  }
>;
export default AppSettingsNotValid;
