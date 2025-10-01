import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";
import type CollectionVersionId from "../ids/CollectionVersionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type ValidationIssue from "../types/ValidationIssue.js";

type DocumentContentNotValid = ResultError<
  "DocumentContentNotValid",
  {
    collectionId: CollectionId;
    collectionVersionId: CollectionVersionId;
    documentId: DocumentId | null;
    issues: ValidationIssue[];
  }
>;
export default DocumentContentNotValid;
