import type { Document } from "@superego/backend";
import type DocumentEntity from "../entities/DocumentEntity.js";
import type DocumentVersionEntity from "../entities/DocumentVersionEntity.js";
import makeDocumentVersion from "./makeDocumentVersion.js";

export default function makeDocument(
  { latestRemoteDocument, ...document }: DocumentEntity,
  latestVersion: DocumentVersionEntity,
): Document {
  return {
    ...document,
    latestVersion: makeDocumentVersion(latestVersion),
  };
}
