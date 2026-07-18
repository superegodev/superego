import type { CollectionId } from "@superego/backend";
import type { CollectionEntity } from "@superego/executing-backend";

type TursoCollection = {
  id: CollectionId;
  /** JSON */
  settings: string;
  /** ISO 8601 */
  created_at: string;
};
export default TursoCollection;

export function toEntity(collection: TursoCollection): CollectionEntity {
  return {
    id: collection.id,
    settings: JSON.parse(collection.settings),
    createdAt: new Date(collection.created_at),
  };
}
