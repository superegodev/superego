import type {
  CollectionId,
  CollectionVersionId,
  ConversationId,
  DocumentId,
  DocumentVersionCreator,
  DocumentVersionId,
} from "@superego/backend";
import type { DocumentRef } from "@superego/schema";

export default interface DocumentVersionEntity {
  id: DocumentVersionId;
  remoteId: string | null;
  previousVersionId: DocumentVersionId | null;
  collectionId: CollectionId;
  documentId: DocumentId;
  collectionVersionId: CollectionVersionId;
  conversationId: ConversationId | null;
  content: any;
  contentFingerprint: string | null;
  referencedDocuments: DocumentRef[];
  createdBy: DocumentVersionCreator;
  createdAt: Date;
}
