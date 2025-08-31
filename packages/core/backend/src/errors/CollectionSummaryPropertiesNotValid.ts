import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";
import type CollectionVersionId from "../ids/CollectionVersionId.js";

import type ValidationIssue from "../types/ValidationIssue.js";

type CollectionSummaryPropertiesNotValid = ResultError<
  "CollectionSummaryPropertiesNotValid",
  {
    collectionId: CollectionId | null;
    collectionVersionId: CollectionVersionId | null;
    issues: ValidationIssue[];
  }
>;
export default CollectionSummaryPropertiesNotValid;
