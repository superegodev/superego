import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";
import CollectionVersionIdSchema from "../ids/CollectionVersionId.js";
import DocumentIdSchema from "../ids/DocumentId.js";
import DocumentVersionIdSchema from "../ids/DocumentVersionId.js";
import ValidationIssueSchema from "../types/ValidationIssue.js";

const ContentSummaryNotValidSchema = defineError(
  "ContentSummaryNotValid",
  v.object({
    collectionId: CollectionIdSchema,
    collectionVersionId: CollectionVersionIdSchema,
    documentId: DocumentIdSchema,
    documentVersionId: DocumentVersionIdSchema,
    issues: v.array(ValidationIssueSchema),
  }),
);
export default ContentSummaryNotValidSchema;
export type ContentSummaryNotValid = v.InferOutput<
  typeof ContentSummaryNotValidSchema
>;
