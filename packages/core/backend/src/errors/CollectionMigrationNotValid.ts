import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";
import ValidationIssueSchema from "../types/ValidationIssue.js";

const CollectionMigrationNotValidSchema = defineError(
  "CollectionMigrationNotValid",
  v.object({
    collectionId: CollectionIdSchema,
    issues: v.array(ValidationIssueSchema),
  }),
);
export default CollectionMigrationNotValidSchema;
export type CollectionMigrationNotValid = v.InferOutput<
  typeof CollectionMigrationNotValidSchema
>;
