import type { CollectionCategoryId, CollectionId } from "@superego/backend";
import type CollectionEntity from "../entities/CollectionEntity.js";

export default interface CollectionRepository {
  insert(collection: CollectionEntity): Promise<void>;
  replace(collection: CollectionEntity): Promise<void>;
  delete(id: CollectionId): Promise<CollectionId>;
  exists(id: CollectionId): Promise<boolean>;
  existsWhereSettingsCollectionCategoryIdEq(
    settingsCollectionCategoryId: CollectionCategoryId,
  ): Promise<boolean>;
  find(id: CollectionId): Promise<CollectionEntity | null>;
  findAll(): Promise<CollectionEntity[]>;
}
