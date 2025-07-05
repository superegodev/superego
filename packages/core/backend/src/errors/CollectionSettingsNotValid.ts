import type CollectionId from "../ids/CollectionId.js";
import type RpcError from "../types/RpcError.js";
import type ValidationIssue from "../types/ValidationIssue.js";

type CollectionSettingsNotValid = RpcError<
  "CollectionSettingsNotValid",
  {
    collectionId: CollectionId | null;
    issues: ValidationIssue[];
  }
>;
export default CollectionSettingsNotValid;
