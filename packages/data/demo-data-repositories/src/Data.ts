import type {
  CollectionCategoryId,
  CollectionId,
  CollectionVersionId,
  DocumentId,
  DocumentVersionId,
  FileId,
  GlobalSettings,
} from "@superego/backend";
import type {
  CollectionCategoryEntity,
  CollectionEntity,
  CollectionVersionEntity,
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
  files: Record<FileId, FileEntity & { content: Uint8Array }>;
  globalSettings: { value: GlobalSettings };
}
