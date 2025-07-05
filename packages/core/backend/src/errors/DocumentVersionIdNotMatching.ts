import type DocumentId from "../ids/DocumentId.js";
import type DocumentVersionId from "../ids/DocumentVersionId.js";
import type RpcError from "../types/RpcError.js";

type DocumentVersionIdNotMatching = RpcError<
  "DocumentVersionIdNotMatching",
  {
    documentId: DocumentId;
    latestVersionId: DocumentVersionId;
    suppliedVersionId: DocumentVersionId;
  }
>;
export default DocumentVersionIdNotMatching;
