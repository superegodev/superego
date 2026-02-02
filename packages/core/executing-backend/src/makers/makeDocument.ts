import type { Document } from "@superego/backend";
import type DocumentEntity from "../entities/DocumentEntity.js";
import type DocumentVersionEntity from "../entities/DocumentVersionEntity.js";
import makeDocumentVersion from "./makeDocumentVersion.js";

export default function makeDocument(
  document: DocumentEntity,
  latestVersion: DocumentVersionEntity,
): Document {
  const { latestRemoteDocument, ...rest } = document;
  return {
    ...rest,
    latestVersion: makeDocumentVersion(latestVersion),
  };
}
