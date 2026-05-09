import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import DocumentIdSchema from "../ids/DocumentId.js";
import DocumentVersionIdSchema from "../ids/DocumentVersionId.js";

const DocumentVersionIdNotMatchingSchema = defineError(
  "DocumentVersionIdNotMatching",
  v.object({
    documentId: DocumentIdSchema,
    latestVersionId: DocumentVersionIdSchema,
    suppliedVersionId: DocumentVersionIdSchema,
  }),
);
export default DocumentVersionIdNotMatchingSchema;
export type DocumentVersionIdNotMatching = v.InferOutput<
  typeof DocumentVersionIdNotMatchingSchema
>;
