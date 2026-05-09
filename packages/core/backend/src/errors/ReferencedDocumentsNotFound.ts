import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";
import DocumentIdSchema from "../ids/DocumentId.js";

// Inline schema for DocumentRef from @superego/schema (structural-only).
const documentRefSchema = v.object({
  collectionId: v.string(),
  documentId: v.string(),
});

const ReferencedDocumentsNotFoundSchema = defineError(
  "ReferencedDocumentsNotFound",
  v.object({
    collectionId: CollectionIdSchema,
    /** The document being created or updated. Null for new documents. */
    documentId: v.nullable(DocumentIdSchema),
    /** DocumentRefs in the content that reference non-existing documents. */
    notFoundDocumentRefs: v.array(documentRefSchema),
  }),
);
export default ReferencedDocumentsNotFoundSchema;
export type ReferencedDocumentsNotFound = v.InferOutput<
  typeof ReferencedDocumentsNotFoundSchema
>;
