import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";
import type DocumentId from "../ids/DocumentId.js";

type DuplicateDocumentDetected = ResultError<
  "DuplicateDocumentDetected",
  {
    collectionId: CollectionId;
    existingDocumentId: DocumentId;
    contentFingerprint: string;
  }
>;
export default DuplicateDocumentDetected;
