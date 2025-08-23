import type {
  CollectionCategoryId,
  CollectionId,
  CollectionVersionId,
  ConversationId,
  DocumentId,
  DocumentVersionId,
  FileId,
  GlobalSettings,
} from "@superego/backend";
import type {
  CollectionCategoryEntity,
  CollectionEntity,
  CollectionVersionEntity,
  ConversationEntity,
  DocumentEntity,
  DocumentVersionEntity,
  FileEntity,
} from "@superego/executing-backend";

export default interface Data {
  version: string;
  collectionCategories: Record<CollectionCategoryId, CollectionCategoryEntity>;
  collections: Record<CollectionId, CollectionEntity>;
  collectionVersions: Record<CollectionVersionId, CollectionVersionEntity>;
  documents: Record<DocumentId, DocumentEntity>;
  documentVersions: Record<DocumentVersionId, DocumentVersionEntity>;
  files: Record<FileId, FileEntity & { content: Uint8Array<ArrayBuffer> }>;
  conversations: Record<ConversationId, ConversationEntity>;
  globalSettings: { value: GlobalSettings };
}
