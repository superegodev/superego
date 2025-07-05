import type {
  CollectionId,
  CollectionVersionId,
  DocumentId,
  DocumentVersionId,
} from "@superego/backend";

export default interface DocumentVersionEntity {
  id: DocumentVersionId;
  previousVersionId: DocumentVersionId | null;
  collectionId: CollectionId;
  documentId: DocumentId;
  collectionVersionId: CollectionVersionId;
  content: any;
  createdAt: Date;
}
