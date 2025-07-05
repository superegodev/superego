import type { CollectionId } from "@superego/backend";
import type { CollectionEntity } from "@superego/executing-backend";

export default interface SqliteCollection {
  id: CollectionId;
  /** JSON */
  settings: string;
  /** ISO8601 */
  created_at: string;
}

export function toEntity(collection: SqliteCollection): CollectionEntity {
  return {
    id: collection.id,
    settings: JSON.parse(collection.settings),
    createdAt: new Date(collection.created_at),
  };
}
