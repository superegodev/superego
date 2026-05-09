import * as v from "valibot";
import { defineError } from "../contracts/contractUtils.js";
import CollectionCategoryIdSchema from "../ids/CollectionCategoryId.js";

const ParentCollectionCategoryNotFoundSchema = defineError(
  "ParentCollectionCategoryNotFound",
  v.object({ parentId: CollectionCategoryIdSchema }),
);
export default ParentCollectionCategoryNotFoundSchema;
export type ParentCollectionCategoryNotFound = v.InferOutput<
  typeof ParentCollectionCategoryNotFoundSchema
>;
