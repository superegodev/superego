import type {
  AppId,
  AppVersionId,
  BackgroundJobId,
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
  AppEntity,
  AppVersionEntity,
  BackgroundJobEntity,
  CollectionCategoryEntity,
  CollectionEntity,
  CollectionVersionEntity,
  ConversationEntity,
  DocumentEntity,
  DocumentVersionEntity,
  FileEntity,
} from "@superego/executing-backend";

export type DocumentTextSearchText = {
  documentId: DocumentId;
  collectionId: CollectionId;
  text: string;
};

export type ConversationTextSearchText = {
  conversationId: ConversationId;
  text: string;
};

export default interface Data {
  version: string;
  apps: Record<AppId, AppEntity>;
  appVersions: Record<AppVersionId, AppVersionEntity>;
  backgroundJobs: Record<BackgroundJobId, BackgroundJobEntity>;
  collectionCategories: Record<CollectionCategoryId, CollectionCategoryEntity>;
  collections: Record<CollectionId, CollectionEntity>;
  collectionVersions: Record<CollectionVersionId, CollectionVersionEntity>;
  conversations: Record<ConversationId, ConversationEntity>;
  documents: Record<DocumentId, DocumentEntity>;
  documentVersions: Record<DocumentVersionId, DocumentVersionEntity>;
  files: Record<FileId, FileEntity & { content: Uint8Array<ArrayBuffer> }>;
  documentTextSearchTexts: Record<DocumentId, DocumentTextSearchText>;
  conversationTextSearchTexts: Record<
    ConversationId,
    ConversationTextSearchText
  >;
  globalSettings: { value: GlobalSettings };
}
