import type CollectionCategoryId from "../ids/CollectionCategoryId.js";
import type CollectionId from "../ids/CollectionId.js";
import type CollectionVersionId from "../ids/CollectionVersionId.js";
import type ConversationId from "../ids/ConversationId.js";
import type DocumentId from "../ids/DocumentId.js";
import type DocumentVersionId from "../ids/DocumentVersionId.js";
import type FileId from "../ids/FileId.js";

export default interface DeletedEntities {
  collectionCategories: CollectionCategoryId[];
  collections: CollectionId[];
  collectionVersions: CollectionVersionId[];
  documents: DocumentId[];
  documentVersion: DocumentVersionId[];
  files: FileId[];
  conversations: ConversationId[];
}
