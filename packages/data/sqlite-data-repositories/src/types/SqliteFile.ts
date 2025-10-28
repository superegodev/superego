import type {
  CollectionId,
  DocumentId,
  DocumentVersionId,
  FileId,
} from "@superego/backend";
import type { FileEntity } from "@superego/executing-backend";

export default interface SqliteFile {
  id: FileId;
  collection_id: CollectionId;
  document_id: DocumentId;
  created_with_document_version_id: DocumentVersionId;
  /** ISO 8601 */
  created_at: string;
  content: Buffer;
}

export function toEntity(file: Omit<SqliteFile, "content">): FileEntity {
  return {
    id: file.id,
    collectionId: file.collection_id,
    documentId: file.document_id,
    createdWithDocumentVersionId: file.created_with_document_version_id,
    createdAt: new Date(file.created_at),
  };
}
