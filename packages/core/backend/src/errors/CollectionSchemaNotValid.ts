import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";
import ProtoCollectionIdSchema from "../ids/ProtoCollectionId.js";
import ValidationIssueSchema from "../types/ValidationIssue.js";

const CollectionSchemaNotValidSchema = defineError(
  "CollectionSchemaNotValid",
  v.object({
    collectionId: v.nullable(
      v.union([CollectionIdSchema, ProtoCollectionIdSchema]),
    ),
    issues: v.array(ValidationIssueSchema),
  }),
);
export default CollectionSchemaNotValidSchema;
export type CollectionSchemaNotValid = v.InferOutput<
  typeof CollectionSchemaNotValidSchema
>;
