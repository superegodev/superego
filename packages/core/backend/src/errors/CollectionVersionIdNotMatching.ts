import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";
import CollectionVersionIdSchema from "../ids/CollectionVersionId.js";

const CollectionVersionIdNotMatchingSchema = defineError(
  "CollectionVersionIdNotMatching",
  v.object({
    collectionId: CollectionIdSchema,
    latestVersionId: CollectionVersionIdSchema,
    suppliedVersionId: CollectionVersionIdSchema,
  }),
);
export default CollectionVersionIdNotMatchingSchema;
export type CollectionVersionIdNotMatching = v.InferOutput<
  typeof CollectionVersionIdNotMatchingSchema
>;
