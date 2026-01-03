import type { CollectionId, DocumentId } from "@superego/backend";
import type DocumentEntity from "../entities/DocumentEntity.js";
import DocumentDoesNotExist from "../errors/DocumentDoesNotExist.js";

export default function assertDocumentExists(
  collectionId: CollectionId,
  documentId: DocumentId,
  document: DocumentEntity | null | undefined,
): asserts document is DocumentEntity {
  if (document === null || document === undefined) {
    throw new DocumentDoesNotExist(collectionId, documentId);
  }
}
