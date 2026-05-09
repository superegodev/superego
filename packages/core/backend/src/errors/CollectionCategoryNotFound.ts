import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionCategoryIdSchema from "../ids/CollectionCategoryId.js";

const CollectionCategoryNotFoundSchema = defineError(
  "CollectionCategoryNotFound",
  v.object({ collectionCategoryId: CollectionCategoryIdSchema }),
);
export default CollectionCategoryNotFoundSchema;
export type CollectionCategoryNotFound = v.InferOutput<
  typeof CollectionCategoryNotFoundSchema
>;
