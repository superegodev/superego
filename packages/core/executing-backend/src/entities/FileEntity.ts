import type {
  CollectionId,
  ConversationId,
  DocumentId,
  DocumentVersionId,
  FileId,
} from "@superego/backend";

interface FileEntity {
  id: FileId;
  referencedBy: FileEntity.Reference[];
  createdAt: Date;
}
namespace FileEntity {
  export interface DocumentVersionReference {
    collectionId: CollectionId;
    documentId: DocumentId;
    documentVersionId: DocumentVersionId;
  }
  export interface ConversationReference {
    conversationId: ConversationId;
  }
  export type Reference = DocumentVersionReference | ConversationReference;
}
export default FileEntity;
