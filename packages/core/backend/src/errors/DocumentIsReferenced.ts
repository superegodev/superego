import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";
import DocumentIdSchema from "../ids/DocumentId.js";

// Inline schema for DocumentRef from @superego/schema (structural-only).
const documentRefSchema = v.object({
  collectionId: v.string(),
  documentId: v.string(),
});

const DocumentIsReferencedSchema = defineError(
  "DocumentIsReferenced",
  v.object({
    /** The document that cannot be deleted. */
    documentId: DocumentIdSchema,
    /** The collection containing the document that cannot be deleted. */
    collectionId: CollectionIdSchema,
    /** Documents that reference this document. */
    referencingDocuments: v.array(documentRefSchema),
  }),
);
export default DocumentIsReferencedSchema;
export type DocumentIsReferenced = v.InferOutput<
  typeof DocumentIsReferencedSchema
>;
