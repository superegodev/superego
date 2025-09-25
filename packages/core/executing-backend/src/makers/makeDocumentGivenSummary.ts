import type { Document, DocumentVersion } from "@superego/backend";
import type DocumentEntity from "../entities/DocumentEntity.js";
import type DocumentVersionEntity from "../entities/DocumentVersionEntity.js";
import makeDocumentVersionGivenSummary from "./makeDocumentVersionGivenSummary.js";

export default function makeDocumentGivenSummary(
  document: DocumentEntity,
  latestVersion: DocumentVersionEntity,
  contentSummary: DocumentVersion["contentSummary"],
): Document {
  return {
    id: document.id,
    collectionId: document.collectionId,
    latestVersion: makeDocumentVersionGivenSummary(
      latestVersion,
      contentSummary,
    ),
    createdAt: document.createdAt,
  };
}
