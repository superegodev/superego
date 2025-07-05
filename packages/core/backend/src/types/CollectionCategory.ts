import type CollectionCategoryId from "../ids/CollectionCategoryId.js";

export default interface CollectionCategory {
  id: CollectionCategoryId;
  name: string;
  icon: string | null;
  /** Top-level categories don't have a parent. */
  parentId: CollectionCategoryId | null;
  createdAt: Date;
}
