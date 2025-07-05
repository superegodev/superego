import type CollectionId from "../ids/CollectionId.js";
import type RpcError from "../types/RpcError.js";
import type ValidationIssue from "../types/ValidationIssue.js";

type CollectionSchemaNotValid = RpcError<
  "CollectionSchemaNotValid",
  {
    collectionId: CollectionId | null;
    issues: ValidationIssue[];
  }
>;
export default CollectionSchemaNotValid;
