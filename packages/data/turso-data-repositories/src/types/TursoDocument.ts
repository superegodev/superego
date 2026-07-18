import type { CollectionId, DocumentId } from "@superego/backend";
import type { DocumentEntity } from "@superego/executing-backend";

type TursoDocument = {
  id: DocumentId;
  collection_id: CollectionId;
  /** ISO 8601 */
  created_at: string;
};
export default TursoDocument;

export function toEntity(document: TursoDocument): DocumentEntity {
  return {
    id: document.id,
    collectionId: document.collection_id,
    createdAt: new Date(document.created_at),
  };
}
