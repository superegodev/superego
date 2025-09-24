import type { ResultError } from "@superego/global-types";
import type FileId from "../ids/FileId.js";

type FileNotFound = ResultError<
  "FileNotFound",
  {
    fileId: FileId;
  }
>;
export default FileNotFound;
