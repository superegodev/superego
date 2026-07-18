import type { CollectionId, DocumentId } from "@superego/backend";

type TursoDocumentTextSearchText = {
  document_id: DocumentId;
  collection_id: CollectionId;
  text: string;
};
export default TursoDocumentTextSearchText;
