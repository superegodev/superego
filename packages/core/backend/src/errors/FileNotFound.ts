import type FileId from "../ids/FileId.js";
import type RpcError from "../types/RpcError.js";

type FileNotFound = RpcError<
  "FileNotFound",
  {
    fileId: FileId;
  }
>;
export default FileNotFound;
