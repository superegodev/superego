import type { ResultError } from "@superego/global-types";
import type { DocumentRef } from "@superego/schema";
import type CollectionId from "../ids/CollectionId.js";
import type DocumentId from "../ids/DocumentId.js";

type ReferencedDocumentsNotFound = ResultError<
  "ReferencedDocumentsNotFound",
  {
    collectionId: CollectionId;
    /** The document being created or updated. Null for new documents. */
    documentId: DocumentId | null;
    /** DocumentRefs in the content that reference non-existing documents. */
    notFoundDocumentRefs: DocumentRef[];
  }
>;
export default ReferencedDocumentsNotFound;
