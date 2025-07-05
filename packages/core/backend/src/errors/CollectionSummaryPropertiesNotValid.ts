import type CollectionId from "../ids/CollectionId.js";
import type CollectionVersionId from "../ids/CollectionVersionId.js";
import type RpcError from "../types/RpcError.js";
import type ValidationIssue from "../types/ValidationIssue.js";

type CollectionSummaryPropertiesNotValid = RpcError<
  "CollectionSummaryPropertiesNotValid",
  {
    collectionId: CollectionId | null;
    collectionVersionId: CollectionVersionId | null;
    issues: ValidationIssue[];
  }
>;
export default CollectionSummaryPropertiesNotValid;
