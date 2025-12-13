import type { ResultError } from "@superego/global-types";
import type FileId from "../ids/FileId.js";

type FilesNotFound = ResultError<
  "FilesNotFound",
  {
    fileIds: FileId[];
  }
>;
export default FilesNotFound;
