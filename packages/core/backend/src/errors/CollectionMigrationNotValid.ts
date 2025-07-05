import type CollectionId from "../ids/CollectionId.js";
import type RpcError from "../types/RpcError.js";
import type ValidationIssue from "../types/ValidationIssue.js";

type CollectionMigrationNotValid = RpcError<
  "CollectionMigrationNotValid",
  {
    collectionId: CollectionId;
    issues: ValidationIssue[];
  }
>;
export default CollectionMigrationNotValid;
