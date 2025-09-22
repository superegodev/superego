import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";
import type CollectionVersionId from "../ids/CollectionVersionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type DocumentVersionId from "../ids/DocumentVersionId.js";
import type ValidationIssue from "../types/ValidationIssue.js";

type ContentSummaryNotValid = ResultError<
  "ContentSummaryNotValid",
  {
    collectionId: CollectionId;
    collectionVersionId: CollectionVersionId;
    documentId: DocumentId;
    documentVersionId: DocumentVersionId;
    issues: ValidationIssue[];
  }
>;
export default ContentSummaryNotValid;
