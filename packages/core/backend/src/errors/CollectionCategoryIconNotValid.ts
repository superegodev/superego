import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionCategoryIdSchema from "../ids/CollectionCategoryId.js";
import ValidationIssueSchema from "../types/ValidationIssue.js";

const CollectionCategoryIconNotValidSchema = defineError(
  "CollectionCategoryIconNotValid",
  v.object({
    collectionCategoryId: v.nullable(CollectionCategoryIdSchema),
    issues: v.array(ValidationIssueSchema),
  }),
);
export default CollectionCategoryIconNotValidSchema;
export type CollectionCategoryIconNotValid = v.InferOutput<
  typeof CollectionCategoryIconNotValidSchema
>;
