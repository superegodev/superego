import type { ResultError } from "@superego/global-types";
import type ValidationIssue from "../types/ValidationIssue.js";

type ConnectorSettingsNotValid = ResultError<
  "ConnectorSettingsNotValid",
  {
    connectorName: string;
    issues: ValidationIssue[];
  }
>;
export default ConnectorSettingsNotValid;
