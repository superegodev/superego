import type { CollectionId, CollectionVersionId } from "@superego/backend";
import type { CollectionVersionEntity } from "@superego/executing-backend";

export default interface SqliteCollectionVersion {
  id: CollectionVersionId;
  previous_version_id: CollectionVersionId | null;
  collection_id: CollectionId;
  /** JSON */
  schema: string;
  /** JSON */
  settings: string;
  /** JSON */
  migration: string | null;
  /** ISO8601 */
  created_at: string;
  is_latest: 0 | 1;
}

export function toEntity(
  collectionVersion: SqliteCollectionVersion,
): CollectionVersionEntity {
  return {
    id: collectionVersion.id,
    previousVersionId: collectionVersion.previous_version_id,
    collectionId: collectionVersion.collection_id,
    schema: JSON.parse(collectionVersion.schema),
    settings: JSON.parse(collectionVersion.settings),
    migration: collectionVersion.migration
      ? JSON.parse(collectionVersion.migration)
      : null,
    createdAt: new Date(collectionVersion.created_at),
  };
}
