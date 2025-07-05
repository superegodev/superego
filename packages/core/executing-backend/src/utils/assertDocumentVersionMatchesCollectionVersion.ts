import type { CollectionId, DocumentId } from "@superego/backend";
import type CollectionVersionEntity from "../entities/CollectionVersionEntity.js";
import type DocumentVersionEntity from "../entities/DocumentVersionEntity.js";
import DocumentVersionCollectionVersionMismatch from "../errors/DocumentVersionCollectionVersionMismatch.js";

export default function assertDocumentVersionMatchesCollectionVersion(
  collectionId: CollectionId,
  collectionVersion: CollectionVersionEntity,
  documentId: DocumentId,
  documentVersion: DocumentVersionEntity,
) {
  if (documentVersion.collectionVersionId !== collectionVersion.id) {
    throw new DocumentVersionCollectionVersionMismatch(
      collectionId,
      collectionVersion.id,
      documentId,
      documentVersion.id,
    );
  }
}
