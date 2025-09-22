import type { ResultError } from "@superego/global-types";
import type DocumentId from "../ids/DocumentId.js";
import type DocumentVersionId from "../ids/DocumentVersionId.js";

type DocumentVersionIdNotMatching = ResultError<
  "DocumentVersionIdNotMatching",
  {
    documentId: DocumentId;
    latestVersionId: DocumentVersionId;
    suppliedVersionId: DocumentVersionId;
  }
>;
export default DocumentVersionIdNotMatching;
