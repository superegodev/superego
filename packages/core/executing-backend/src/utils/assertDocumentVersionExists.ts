import type { CollectionId, DocumentId } from "@superego/backend";
import type DocumentVersionEntity from "../entities/DocumentVersionEntity.js";
import DocumentHasNoVersions from "../errors/DocumentHasNoVersions.js";

export default function assertDocumentVersionExists(
  collectionId: CollectionId,
  documentId: DocumentId,
  documentVersion: DocumentVersionEntity | null | undefined,
): asserts documentVersion is DocumentVersionEntity {
  if (documentVersion === null || documentVersion === undefined) {
    throw new DocumentHasNoVersions(collectionId, documentId);
  }
}
