import type { Document, DocumentVersion } from "@superego/backend";
import type DocumentEntity from "../entities/DocumentEntity.js";
import type DocumentVersionEntity from "../entities/DocumentVersionEntity.js";
import makeDocumentVersionGivenSummary from "./makeDocumentVersionGivenSummary.js";

export default function makeDocumentGivenSummary(
  { latestRemoteDocument, ...document }: DocumentEntity,
  latestVersion: DocumentVersionEntity,
  contentSummary: DocumentVersion["contentSummary"],
): Document {
  return {
    ...document,
    latestVersion: makeDocumentVersionGivenSummary(
      latestVersion,
      contentSummary,
    ),
  };
}
