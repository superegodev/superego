import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionCategoryIdSchema from "../ids/CollectionCategoryId.js";

const ParentCollectionCategoryIsDescendantSchema = defineError(
  "ParentCollectionCategoryIsDescendant",
  v.object({ parentId: CollectionCategoryIdSchema }),
);
export default ParentCollectionCategoryIsDescendantSchema;
export type ParentCollectionCategoryIsDescendant = v.InferOutput<
  typeof ParentCollectionCategoryIsDescendantSchema
>;
