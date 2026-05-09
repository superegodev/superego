import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionCategoryIdSchema from "../ids/CollectionCategoryId.js";
import ValidationIssueSchema from "../types/ValidationIssue.js";

const CollectionCategoryNameNotValidSchema = defineError(
  "CollectionCategoryNameNotValid",
  v.object({
    collectionCategoryId: v.nullable(CollectionCategoryIdSchema),
    issues: v.array(ValidationIssueSchema),
  }),
);
export default CollectionCategoryNameNotValidSchema;
export type CollectionCategoryNameNotValid = v.InferOutput<
  typeof CollectionCategoryNameNotValidSchema
>;
