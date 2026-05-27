import type { CollectionId, DocumentId } from "@superego/backend";

export default interface DocumentEntity {
  id: DocumentId;
  collectionId: CollectionId;
  createdAt: Date;
}
