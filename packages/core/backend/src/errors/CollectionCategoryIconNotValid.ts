import type CollectionCategoryId from "../ids/CollectionCategoryId.js";
import type RpcError from "../types/RpcError.js";
import type ValidationIssue from "../types/ValidationIssue.js";

type CollectionCategoryIconNotValid = RpcError<
  "CollectionCategoryIconNotValid",
  {
    collectionCategoryId: CollectionCategoryId | null;
    issues: ValidationIssue[];
  }
>;
export default CollectionCategoryIconNotValid;
