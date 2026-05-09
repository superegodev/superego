import * as v from "valibot";
import CollectionIdSchema from "../ids/CollectionId.js";
import DocumentIdSchema from "../ids/DocumentId.js";
import DocumentVersionSchema from "./DocumentVersion.js";

const baseDocumentEntries = {
  id: DocumentIdSchema,
  collectionId: CollectionIdSchema,
  latestVersion: DocumentVersionSchema,
  createdAt: v.date(),
};

const DocumentSchema = v.union([
  v.object({
    ...baseDocumentEntries,
    /** Id of the remote counterpart of this document. */
    remoteId: v.null(),
    /** Url of the remote counterpart of this document. */
    remoteUrl: v.null(),
  }),
  v.object({
    ...baseDocumentEntries,
    /** Id of the remote counterpart of this document. */
    remoteId: v.string(),
    /** Url of the remote counterpart of this document. */
    remoteUrl: v.nullable(v.string()),
  }),
]);
export default DocumentSchema;
export type Document = v.InferOutput<typeof DocumentSchema>;
