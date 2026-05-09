import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";
import ValidationIssueSchema from "../types/ValidationIssue.js";

const RemoteConvertersNotValidSchema = defineError(
  "RemoteConvertersNotValid",
  v.object({
    collectionId: CollectionIdSchema,
    issues: v.array(ValidationIssueSchema),
  }),
);
export default RemoteConvertersNotValidSchema;
export type RemoteConvertersNotValid = v.InferOutput<
  typeof RemoteConvertersNotValidSchema
>;
