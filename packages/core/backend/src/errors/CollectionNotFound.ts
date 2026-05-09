import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionIdSchema from "../ids/CollectionId.js";

const CollectionNotFoundSchema = defineError(
  "CollectionNotFound",
  v.object({ collectionId: CollectionIdSchema }),
);
export default CollectionNotFoundSchema;
export type CollectionNotFound = v.InferOutput<typeof CollectionNotFoundSchema>;
