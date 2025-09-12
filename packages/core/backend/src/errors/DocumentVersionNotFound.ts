import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type DocumentVersionId from "../ids/DocumentVersionId.js";

type DocumentVersionNotFound = ResultError<
  "DocumentVersionNotFound",
  {
    collectionId: CollectionId;
    documentId: DocumentId;
    documentVersionId: DocumentVersionId;
  }
>;
export default DocumentVersionNotFound;
