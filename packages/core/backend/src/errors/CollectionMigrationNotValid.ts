import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";
import type ValidationIssue from "../types/ValidationIssue.js";

type CollectionMigrationNotValid = ResultError<
  "CollectionMigrationNotValid",
  {
    collectionId: CollectionId;
    issues: ValidationIssue[];
  }
>;
export default CollectionMigrationNotValid;
