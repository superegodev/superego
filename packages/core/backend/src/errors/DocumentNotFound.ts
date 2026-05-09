import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import DocumentIdSchema from "../ids/DocumentId.js";

const DocumentNotFoundSchema = defineError(
  "DocumentNotFound",
  v.object({ documentId: DocumentIdSchema }),
);
export default DocumentNotFoundSchema;
export type DocumentNotFound = v.InferOutput<typeof DocumentNotFoundSchema>;
