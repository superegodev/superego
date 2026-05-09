import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";
import CollectionVersionIdSchema from "../ids/CollectionVersionId.js";
import DocumentIdSchema from "../ids/DocumentId.js";
import ValidationIssueSchema from "../types/ValidationIssue.js";

const DocumentContentNotValidSchema = defineError(
  "DocumentContentNotValid",
  v.object({
    collectionId: CollectionIdSchema,
    collectionVersionId: CollectionVersionIdSchema,
    documentId: v.nullable(DocumentIdSchema),
    issues: v.array(ValidationIssueSchema),
  }),
);
export default DocumentContentNotValidSchema;
export type DocumentContentNotValid = v.InferOutput<
  typeof DocumentContentNotValidSchema
>;
