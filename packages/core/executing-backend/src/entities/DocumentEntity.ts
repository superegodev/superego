import type { CollectionId, DocumentId } from "@superego/backend";

export default interface DocumentEntity {
  id: DocumentId;
  remoteId: string | null;
  collectionId: CollectionId;
  createdAt: Date;
}
