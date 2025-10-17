import type {
  CollectionId,
  CollectionVersionId,
  ConversationId,
  DocumentId,
  DocumentVersionCreator,
  DocumentVersionId,
} from "@superego/backend";

export default interface DocumentVersionEntity {
  id: DocumentVersionId;
  remoteId: string | null;
  previousVersionId: DocumentVersionId | null;
  collectionId: CollectionId;
  documentId: DocumentId;
  collectionVersionId: CollectionVersionId;
  conversationId: ConversationId | null;
  content: any;
  createdBy: DocumentVersionCreator;
  createdAt: Date;
}
