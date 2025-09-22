import type { ResultError } from "@superego/global-types";
import type DocumentId from "../ids/DocumentId.js";

type DocumentNotFound = ResultError<
  "DocumentNotFound",
  {
    documentId: DocumentId;
  }
>;
export default DocumentNotFound;
