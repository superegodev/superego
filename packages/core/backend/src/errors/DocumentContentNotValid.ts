import type CollectionId from "../ids/CollectionId.js";
import type CollectionVersionId from "../ids/CollectionVersionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type RpcError from "../types/RpcError.js";
import type ValidationIssue from "../types/ValidationIssue.js";

type DocumentContentNotValid = RpcError<
  "DocumentContentNotValid",
  {
    collectionId: CollectionId;
    collectionVersionId: CollectionVersionId;
    documentId: DocumentId | null;
    issues: ValidationIssue[];
  }
>;
export default DocumentContentNotValid;
