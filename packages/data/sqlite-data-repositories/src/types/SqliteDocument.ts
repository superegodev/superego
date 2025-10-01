import type { CollectionId, DocumentId } from "@superego/backend";
import type { DocumentEntity } from "@superego/executing-backend";

export default interface SqliteDocument {
  id: DocumentId;
  remote_id: string | null;
  collection_id: CollectionId;
  /** ISO8601 */
  created_at: string;
}

export function toEntity(document: SqliteDocument): DocumentEntity {
  return {
    id: document.id,
    remoteId: document.remote_id,
    collectionId: document.collection_id,
    createdAt: new Date(document.created_at),
  };
}
