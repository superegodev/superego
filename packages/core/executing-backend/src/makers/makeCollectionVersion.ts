import type { CollectionVersion } from "@superego/backend";
import type CollectionVersionEntity from "../entities/CollectionVersionEntity.js";

export default function makeCollectionVersion(
  collectionVersion: CollectionVersionEntity,
): CollectionVersion {
  return {
    id: collectionVersion.id,
    schema: collectionVersion.schema,
    settings: collectionVersion.settings,
    previousVersionId: collectionVersion.previousVersionId,
    migration: collectionVersion.migration,
    createdAt: collectionVersion.createdAt,
  };
}
