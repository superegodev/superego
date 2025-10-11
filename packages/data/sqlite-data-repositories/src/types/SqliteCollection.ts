import { decode } from "@msgpack/msgpack";
import type { CollectionId } from "@superego/backend";
import type {
  CollectionEntity,
  RemoteEntity,
} from "@superego/executing-backend";

export default interface SqliteCollection {
  id: CollectionId;
  /** JSON */
  settings: string;
  /** MessagePack */
  remote: Buffer | null;
  /** ISO8601 */
  created_at: string;
}

export function toEntity(collection: SqliteCollection): CollectionEntity {
  return {
    id: collection.id,
    settings: JSON.parse(collection.settings),
    remote: collection.remote
      ? (decode(collection.remote) as RemoteEntity)
      : null,
    createdAt: new Date(collection.created_at),
  };
}
