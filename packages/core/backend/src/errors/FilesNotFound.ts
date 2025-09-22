import type { ResultError } from "@superego/global-types";
import type CollectionId from "../ids/CollectionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type FileId from "../ids/FileId.js";

type FilesNotFound = ResultError<
  "FilesNotFound",
  {
    collectionId: CollectionId;
    documentId: DocumentId | null;
    fileIds: FileId[];
  }
>;
export default FilesNotFound;
