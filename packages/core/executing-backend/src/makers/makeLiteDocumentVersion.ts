import type { DocumentVersion, LiteDocumentVersion } from "@superego/backend";

export default function makeLiteDocumentVersion(
  documentVersion: DocumentVersion,
): LiteDocumentVersion {
  const { content, ...liteDocumentVersion } = documentVersion;
  return liteDocumentVersion;
}
