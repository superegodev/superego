import type { CollectionId, CollectionVersionId } from "@superego/backend";
import type { CollectionVersionEntity } from "@superego/executing-backend";

type SqliteCollectionVersion = {
  id: CollectionVersionId;
  previous_version_id: CollectionVersionId | null;
  collection_id: CollectionId;
  /** JSON */
  schema: string;
  /** JSON */
  settings: string;
  /** JSON */
  migration: string | null;
  /** ISO 8601 */
  created_at: string;
  is_latest: 0 | 1;
};
export default SqliteCollectionVersion;

export function toEntity(
  collectionVersion: SqliteCollectionVersion,
): CollectionVersionEntity {
  const settings = JSON.parse(collectionVersion.settings);
  const migration = collectionVersion.migration
    ? JSON.parse(collectionVersion.migration)
    : null;
  return {
    id: collectionVersion.id,
    previousVersionId: collectionVersion.previous_version_id,
    collectionId: collectionVersion.collection_id,
    schema: JSON.parse(collectionVersion.schema),
    settings: {
      ...settings,
      contentSummaryGetter: toTypescriptModule(settings.contentSummaryGetter),
      contentBlockingKeysGetter:
        settings.contentBlockingKeysGetter === null
          ? null
          : toTypescriptModule(settings.contentBlockingKeysGetter),
    },
    migration: migration === null ? null : toTypescriptModule(migration),
    createdAt: new Date(collectionVersion.created_at),
  };
}

function toTypescriptModule(value: unknown): string {
  return typeof value === "object" &&
    value !== null &&
    "source" in value &&
    typeof value.source === "string"
    ? value.source
    : (value as string);
}
