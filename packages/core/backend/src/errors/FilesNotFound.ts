import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import FileIdSchema from "../ids/FileId.js";

const FilesNotFoundSchema = defineError(
  "FilesNotFound",
  v.object({ fileIds: v.array(FileIdSchema) }),
);
export default FilesNotFoundSchema;
export type FilesNotFound = v.InferOutput<typeof FilesNotFoundSchema>;
