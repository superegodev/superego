import type { CollectionId, DocumentId } from "@superego/backend";
import type { DocumentEntity } from "@superego/executing-backend";

type SqliteDocument = {
  id: DocumentId;
  collection_id: CollectionId;
  /** ISO 8601 */
  created_at: string;
};
export default SqliteDocument;

export function toEntity(document: SqliteDocument): DocumentEntity {
  return {
    id: document.id,
    collectionId: document.collection_id,
    createdAt: new Date(document.created_at),
  };
}
