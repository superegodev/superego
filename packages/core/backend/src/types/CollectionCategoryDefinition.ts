import * as v from "valibot";
import CollectionCategoryIdSchema from "../ids/CollectionCategoryId.js";
import ProtoCollectionCategoryIdSchema from "../ids/ProtoCollectionCategoryId.js";

const CollectionCategoryDefinitionSchema = v.object({
  name: v.string(),
  icon: v.nullable(v.string()),
  parentId: v.nullable(CollectionCategoryIdSchema),
});
export default CollectionCategoryDefinitionSchema;
export type CollectionCategoryDefinition = v.InferOutput<
  typeof CollectionCategoryDefinitionSchema
>;

/**
 * Variant used inside Pack definitions, where parentId may also be a
 * ProtoCollectionCategoryId referencing a sibling pack entry.
 */
export const PackCollectionCategoryDefinitionSchema = v.object({
  name: v.string(),
  icon: v.nullable(v.string()),
  parentId: v.nullable(
    v.union([ProtoCollectionCategoryIdSchema, CollectionCategoryIdSchema]),
  ),
});
export type PackCollectionCategoryDefinition = v.InferOutput<
  typeof PackCollectionCategoryDefinitionSchema
>;
