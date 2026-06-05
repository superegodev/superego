import type { CollectionId, DocumentId } from "@superego/backend";

type SqliteDocumentTextSearchText = {
  document_id: DocumentId;
  collection_id: CollectionId;
  text: string;
};
export default SqliteDocumentTextSearchText;
