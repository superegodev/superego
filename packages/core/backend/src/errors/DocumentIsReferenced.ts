import type { ResultError } from "@superego/global-types";
import type { DocumentRef } from "@superego/schema";
import type CollectionId from "../ids/CollectionId.js";
import type DocumentId from "../ids/DocumentId.js";

type DocumentIsReferenced = ResultError<
  "DocumentIsReferenced",
  {
    /** The document that cannot be deleted. */
    documentId: DocumentId;
    /** The collection containing the document that cannot be deleted. */
    collectionId: CollectionId;
    /** Documents that reference this document. */
    referencingDocuments: DocumentRef[];
  }
>;
export default DocumentIsReferenced;
