import type { CollectionId, DocumentVersionId } from "@superego/backend";

type SqliteDocumentVersionBlockingKey = {
  id: number;
  collection_id: CollectionId;
  document_version_id: DocumentVersionId;
  blocking_key: string;
};
export default SqliteDocumentVersionBlockingKey;
