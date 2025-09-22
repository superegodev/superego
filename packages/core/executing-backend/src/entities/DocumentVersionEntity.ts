import type {
  CollectionId,
  CollectionVersionId,
  ConversationId,
  DocumentId,
  DocumentVersionCreator,
  DocumentVersionId,
} from "@superego/backend";

type DocumentVersionEntity = {
  id: DocumentVersionId;
  previousVersionId: DocumentVersionId | null;
  collectionId: CollectionId;
  documentId: DocumentId;
  collectionVersionId: CollectionVersionId;
  conversationId: ConversationId | null;
  content: any;
  createdBy: DocumentVersionCreator;
  createdAt: Date;
} & (
  | { createdBy: DocumentVersionCreator.User; conversationId: null }
  | { createdBy: DocumentVersionCreator.Migration; conversationId: null }
  | {
      createdBy: DocumentVersionCreator.Assistant;
      conversationId: ConversationId;
    }
);
export default DocumentVersionEntity;
