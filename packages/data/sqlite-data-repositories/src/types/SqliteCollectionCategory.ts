import type { CollectionCategoryId } from "@superego/backend";
import type { CollectionCategoryEntity } from "@superego/executing-backend";

export default interface SqliteCollectionCategory {
  id: CollectionCategoryId;
  name: string;
  icon: string | null;
  parent_id: CollectionCategoryId | null;
  /** ISO 8601 */
  created_at: string;
}

export function toEntity(
  collectionCategory: SqliteCollectionCategory,
): CollectionCategoryEntity {
  return {
    id: collectionCategory.id,
    name: collectionCategory.name,
    icon: collectionCategory.icon,
    parentId: collectionCategory.parent_id,
    createdAt: new Date(collectionCategory.created_at),
  };
}
