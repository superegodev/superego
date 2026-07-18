import type { CollectionCategoryId } from "@superego/backend";
import type { CollectionCategoryEntity } from "@superego/executing-backend";

type TursoCollectionCategory = {
  id: CollectionCategoryId;
  name: string;
  icon: string | null;
  parent_id: CollectionCategoryId | null;
  /** ISO 8601 */
  created_at: string;
};
export default TursoCollectionCategory;

export function toEntity(
  collectionCategory: TursoCollectionCategory,
): CollectionCategoryEntity {
  return {
    id: collectionCategory.id,
    name: collectionCategory.name,
    icon: collectionCategory.icon,
    parentId: collectionCategory.parent_id,
    createdAt: new Date(collectionCategory.created_at),
  };
}
