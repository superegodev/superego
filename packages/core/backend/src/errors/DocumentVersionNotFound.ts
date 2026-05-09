import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";
import DocumentIdSchema from "../ids/DocumentId.js";
import DocumentVersionIdSchema from "../ids/DocumentVersionId.js";

const DocumentVersionNotFoundSchema = defineError(
  "DocumentVersionNotFound",
  v.object({
    collectionId: CollectionIdSchema,
    documentId: DocumentIdSchema,
    documentVersionId: DocumentVersionIdSchema,
  }),
);
export default DocumentVersionNotFoundSchema;
export type DocumentVersionNotFound = v.InferOutput<
  typeof DocumentVersionNotFoundSchema
>;
