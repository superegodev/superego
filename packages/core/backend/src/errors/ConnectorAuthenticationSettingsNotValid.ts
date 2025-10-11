import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";
import type ValidationIssue from "../types/ValidationIssue.js";

type ConnectorAuthenticationSettingsNotValid = ResultError<
  "ConnectorAuthenticationSettingsNotValid",
  {
    collectionId: CollectionId;
    connectorName: string;
    issues: ValidationIssue[];
  }
>;
export default ConnectorAuthenticationSettingsNotValid;
