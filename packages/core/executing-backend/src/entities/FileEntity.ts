import type {
  CollectionId,
  DocumentId,
  DocumentVersionId,
  FileId,
} from "@superego/backend";

export default interface FileEntity {
  id: FileId;
  collectionId: CollectionId;
  documentId: DocumentId;
  createdWithDocumentVersionId: DocumentVersionId;
  createdAt: Date;
}
