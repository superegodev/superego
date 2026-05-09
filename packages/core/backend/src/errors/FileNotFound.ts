import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import FileIdSchema from "../ids/FileId.js";

const FileNotFoundSchema = defineError(
  "FileNotFound",
  v.object({ fileId: FileIdSchema }),
);
export default FileNotFoundSchema;
export type FileNotFound = v.InferOutput<typeof FileNotFoundSchema>;
