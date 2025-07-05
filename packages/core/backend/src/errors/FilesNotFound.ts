import type CollectionId from "../ids/CollectionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type FileId from "../ids/FileId.js";
import type RpcError from "../types/RpcError.js";

type FilesNotFound = RpcError<
  "FilesNotFound",
  {
    collectionId: CollectionId;
    documentId: DocumentId | null;
    fileIds: FileId[];
  }
>;
export default FilesNotFound;
