import type CollectionCategoryId from "../ids/CollectionCategoryId.js";
import type RpcError from "../types/RpcError.js";
import type ValidationIssue from "../types/ValidationIssue.js";

type CollectionCategoryNameNotValid = RpcError<
  "CollectionCategoryNameNotValid",
  {
    collectionCategoryId: CollectionCategoryId | null;
    issues: ValidationIssue[];
  }
>;
export default CollectionCategoryNameNotValid;
