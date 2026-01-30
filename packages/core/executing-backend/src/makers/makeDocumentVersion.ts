import type { DocumentVersion } from "@superego/backend";
import type DocumentVersionEntity from "../entities/DocumentVersionEntity.js";

export default function makeDocumentVersion(
  documentVersion: DocumentVersionEntity,
): DocumentVersion {
  const { documentId, collectionId, ...rest } = documentVersion;
  return rest;
}
