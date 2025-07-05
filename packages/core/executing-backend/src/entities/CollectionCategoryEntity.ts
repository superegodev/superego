import type { CollectionCategoryId } from "@superego/backend";

export default interface CollectionCategoryEntity {
  id: CollectionCategoryId;
  name: string;
  icon: string | null;
  parentId: CollectionCategoryId | null;
  createdAt: Date;
}
