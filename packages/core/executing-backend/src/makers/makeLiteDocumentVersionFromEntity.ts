import type { LiteDocumentVersion } from "@superego/backend";
import type DocumentVersionEntity from "../entities/DocumentVersionEntity.js";

export default function makeLiteDocumentVersionFromEntity(
  documentVersion: DocumentVersionEntity,
  contentSummary: LiteDocumentVersion["contentSummary"],
): LiteDocumentVersion {
  const { documentId, collectionId, content, ...rest } = documentVersion;
  return { ...rest, contentSummary };
}
