import type { DocumentVersion } from "@superego/backend";
import type DocumentVersionEntity from "../entities/DocumentVersionEntity.js";

export default function makeDocumentVersionGivenSummary(
  documentVersion: DocumentVersionEntity,
  contentSummary: DocumentVersion["contentSummary"],
): DocumentVersion {
  const { documentId, collectionId, ...rest } = documentVersion;
  return { ...rest, contentSummary };
}
