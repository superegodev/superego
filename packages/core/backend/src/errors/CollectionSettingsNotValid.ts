import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";
import ValidationIssueSchema from "../types/ValidationIssue.js";

const CollectionSettingsNotValidSchema = defineError(
  "CollectionSettingsNotValid",
  v.object({
    collectionId: v.nullable(CollectionIdSchema),
    issues: v.array(ValidationIssueSchema),
  }),
);
export default CollectionSettingsNotValidSchema;
export type CollectionSettingsNotValid = v.InferOutput<
  typeof CollectionSettingsNotValidSchema
>;
