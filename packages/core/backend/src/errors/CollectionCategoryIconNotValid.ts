import type { ResultError } from "@superego/global-types";
import type CollectionCategoryId from "../ids/CollectionCategoryId.js";

import type ValidationIssue from "../types/ValidationIssue.js";

type CollectionCategoryIconNotValid = ResultError<
  "CollectionCategoryIconNotValid",
  {
    collectionCategoryId: CollectionCategoryId | null;
    issues: ValidationIssue[];
  }
>;
export default CollectionCategoryIconNotValid;
