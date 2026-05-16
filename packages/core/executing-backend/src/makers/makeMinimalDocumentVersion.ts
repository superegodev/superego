import type { MinimalDocumentVersion } from "@superego/backend";
import type MinimalDocumentVersionEntity from "../entities/MinimalDocumentVersionEntity.js";

export default function makeMinimalDocumentVersion(
  entity: MinimalDocumentVersionEntity,
): MinimalDocumentVersion {
  const { documentId, collectionId, referencedDocuments, ...rest } = entity;
  return rest;
}
