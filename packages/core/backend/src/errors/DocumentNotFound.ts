import type DocumentId from "../ids/DocumentId.js";
import type RpcError from "../types/RpcError.js";

type DocumentNotFound = RpcError<
  "DocumentNotFound",
  {
    documentId: DocumentId;
  }
>;
export default DocumentNotFound;
