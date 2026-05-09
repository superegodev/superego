import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";
import DocumentSchema from "../types/Document.js";

const DuplicateDocumentDetectedSchema = defineError(
  "DuplicateDocumentDetected",
  v.object({
    collectionId: CollectionIdSchema,
    duplicateDocument: DocumentSchema,
  }),
);
export default DuplicateDocumentDetectedSchema;
export type DuplicateDocumentDetected = v.InferOutput<
  typeof DuplicateDocumentDetectedSchema
>;
