import * as v from "valibot";
import CollectionIdSchema from "../ids/CollectionId.js";
import DocumentIdSchema from "../ids/DocumentId.js";
import LiteDocumentVersionSchema from "./LiteDocumentVersion.js";

// Mirrors the Document discriminated union with `latestVersion` swapped out for
// the lite variant.
const baseLiteDocumentEntries = {
  id: DocumentIdSchema,
  collectionId: CollectionIdSchema,
  latestVersion: LiteDocumentVersionSchema,
  createdAt: v.date(),
};

const LiteDocumentSchema = v.union([
  v.object({
    ...baseLiteDocumentEntries,
    remoteId: v.null(),
    remoteUrl: v.null(),
  }),
  v.object({
    ...baseLiteDocumentEntries,
    remoteId: v.string(),
    remoteUrl: v.nullable(v.string()),
  }),
]);
export default LiteDocumentSchema;
export type LiteDocument = v.InferOutput<typeof LiteDocumentSchema>;
