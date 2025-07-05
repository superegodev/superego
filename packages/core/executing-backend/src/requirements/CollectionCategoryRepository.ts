import type { CollectionCategoryId } from "@superego/backend";
import type CollectionCategoryEntity from "../entities/CollectionCategoryEntity.js";

export default interface CollectionCategoryRepository {
  insert(collectionCategory: CollectionCategoryEntity): Promise<void>;
  replace(collectionCategory: CollectionCategoryEntity): Promise<void>;
  delete(id: CollectionCategoryId): Promise<CollectionCategoryId>;
  exists(id: CollectionCategoryId): Promise<boolean>;
  existsWhereParentIdEq(parentId: CollectionCategoryId): Promise<boolean>;
  find(id: CollectionCategoryId): Promise<CollectionCategoryEntity | null>;
  findAll(): Promise<CollectionCategoryEntity[]>;
}
