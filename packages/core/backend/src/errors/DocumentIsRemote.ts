import type { ResultError } from "@superego/global-types";
import type DocumentId from "../ids/DocumentId.js";

type DocumentIsRemote = ResultError<
  "DocumentIsRemote",
  {
    documentId: DocumentId;
    message: "Remote documents are read-only. You can't create new versions or delete them.";
  }
>;
export default DocumentIsRemote;
