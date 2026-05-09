import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";
import CollectionVersionIdSchema from "../ids/CollectionVersionId.js";
import ValidationIssueSchema from "../types/ValidationIssue.js";

const ContentBlockingKeysGetterNotValidSchema = defineError(
  "ContentBlockingKeysGetterNotValid",
  v.object({
    collectionId: v.nullable(CollectionIdSchema),
    collectionVersionId: v.nullable(CollectionVersionIdSchema),
    issues: v.array(ValidationIssueSchema),
  }),
);
export default ContentBlockingKeysGetterNotValidSchema;
export type ContentBlockingKeysGetterNotValid = v.InferOutput<
  typeof ContentBlockingKeysGetterNotValidSchema
>;
