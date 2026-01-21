import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";
import type Document from "../types/Document.js";

type DuplicateDocumentDetected = ResultError<
  "DuplicateDocumentDetected",
  {
    collectionId: CollectionId;
    duplicateDocument: Document;
  }
>;
export default DuplicateDocumentDetected;
