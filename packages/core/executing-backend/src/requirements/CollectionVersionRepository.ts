import type { CollectionId, CollectionVersionId } from "@superego/backend";
import type CollectionVersionEntity from "../entities/CollectionVersionEntity.js";

export default interface CollectionVersionRepository {
  insert(collectionVersion: CollectionVersionEntity): Promise<void>;
  replace(collectionVersion: CollectionVersionEntity): Promise<void>;
  deleteAllWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<CollectionVersionId[]>;
  find(id: CollectionVersionId): Promise<CollectionVersionEntity | null>;
  findLatestWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<CollectionVersionEntity | null>;
  findAllLatests(): Promise<CollectionVersionEntity[]>;
}
