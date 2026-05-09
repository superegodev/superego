import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionCategoryIdSchema from "../ids/CollectionCategoryId.js";

const CollectionCategoryHasChildrenSchema = defineError(
  "CollectionCategoryHasChildren",
  v.object({ collectionCategoryId: CollectionCategoryIdSchema }),
);
export default CollectionCategoryHasChildrenSchema;
export type CollectionCategoryHasChildren = v.InferOutput<
  typeof CollectionCategoryHasChildrenSchema
>;
