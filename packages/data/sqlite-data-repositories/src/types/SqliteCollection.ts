import { decode } from "@msgpack/msgpack";
import type { CollectionId } from "@superego/backend";
import type {
  CollectionEntity,
  RemoteEntity,
} from "@superego/executing-backend";

type SqliteCollection = {
  id: CollectionId;
  /** JSON */
  settings: string;
  /** MessagePack */
  remote: Buffer | null;
  /** ISO 8601 */
  created_at: string;
};
export default SqliteCollection;

export function toEntity(collection: SqliteCollection): CollectionEntity {
  const settings = JSON.parse(collection.settings);
  return {
    id: collection.id,
    settings: {
      ...settings,
      redirectToCollectionAfterDocumentCreation:
        settings.redirectToCollectionAfterDocumentCreation ?? false,
    },
    remote: collection.remote
      ? (decode(collection.remote) as RemoteEntity)
      : null,
    createdAt: new Date(collection.created_at),
  };
}
