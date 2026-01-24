import { decode } from "@msgpack/msgpack";
import type {
  CollectionId,
  CollectionVersionId,
  RemoteConverters,
} from "@superego/backend";
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
  content_blocking_keys_getter: string | null;
  /** JSON */
  migration: string | null;
  /** MessagePack */
  remote_converters: Buffer | null;
  /** ISO 8601 */
  created_at: string;
  is_latest: 0 | 1;
};
export default SqliteCollectionVersion;

export function toEntity(
  collectionVersion: SqliteCollectionVersion,
): CollectionVersionEntity {
  return {
    id: collectionVersion.id,
    previousVersionId: collectionVersion.previous_version_id,
    collectionId: collectionVersion.collection_id,
    schema: JSON.parse(collectionVersion.schema),
    settings: JSON.parse(collectionVersion.settings),
    contentBlockingKeysGetter: collectionVersion.content_blocking_keys_getter
      ? JSON.parse(collectionVersion.content_blocking_keys_getter)
      : null,
    migration: collectionVersion.migration
      ? JSON.parse(collectionVersion.migration)
      : null,
    remoteConverters: collectionVersion.remote_converters
      ? (decode(collectionVersion.remote_converters) as RemoteConverters)
      : null,
    createdAt: new Date(collectionVersion.created_at),
  };
}
