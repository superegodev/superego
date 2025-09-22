import type { ResultError } from "@superego/global-types";
import type CollectionCategoryId from "../ids/CollectionCategoryId.js";

import type ValidationIssue from "../types/ValidationIssue.js";

type CollectionCategoryNameNotValid = ResultError<
  "CollectionCategoryNameNotValid",
  {
    collectionCategoryId: CollectionCategoryId | null;
    issues: ValidationIssue[];
  }
>;
export default CollectionCategoryNameNotValid;
