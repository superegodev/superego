import type { CollectionCategory } from "@superego/backend";
import type CollectionCategoryEntity from "../entities/CollectionCategoryEntity.js";

export default function makeCollectionCategory(
  collectionCategory: CollectionCategoryEntity,
): CollectionCategory {
  return {
    id: collectionCategory.id,
    name: collectionCategory.name,
    icon: collectionCategory.icon,
    parentId: collectionCategory.parentId,
    createdAt: collectionCategory.createdAt,
  };
}
