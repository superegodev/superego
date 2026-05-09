import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";
import CollectionVersionIdSchema from "../ids/CollectionVersionId.js";

const CollectionVersionNotFoundSchema = defineError(
  "CollectionVersionNotFound",
  v.object({
    collectionId: CollectionIdSchema,
    collectionVersionId: CollectionVersionIdSchema,
  }),
);
export default CollectionVersionNotFoundSchema;
export type CollectionVersionNotFound = v.InferOutput<
  typeof CollectionVersionNotFoundSchema
>;
