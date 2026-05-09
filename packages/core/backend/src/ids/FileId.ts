import * as v from "valibot";
import { idPattern } from "./_internal/idPattern.js";

type FileId = `File_${string}`;
const FileIdSchema = v.pipe(
  v.string(),
  v.regex(idPattern("File")),
) as v.GenericSchema<FileId, FileId>;
export default FileIdSchema;
export type { FileId };
