import * as v from "valibot";
import CollectionCategoryIdSchema from "../ids/CollectionCategoryId.js";

const CollectionCategorySchema = v.object({
  id: CollectionCategoryIdSchema,
  name: v.string(),
  icon: v.nullable(v.string()),
  /** Top-level categories don't have a parent. */
  parentId: v.nullable(CollectionCategoryIdSchema),
  createdAt: v.date(),
});
export default CollectionCategorySchema;
export type CollectionCategory = v.InferOutput<typeof CollectionCategorySchema>;
