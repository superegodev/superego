import type { DocumentVersion } from "@superego/backend";
import type CollectionVersionEntity from "../entities/CollectionVersionEntity.js";
import type DocumentVersionEntity from "../entities/DocumentVersionEntity.js";
import type JavascriptSandbox from "../requirements/JavascriptSandbox.js";

export default async function makeDocumentVersion(
  javascriptSandbox: JavascriptSandbox,
  collectionVersion: CollectionVersionEntity,
  documentVersion: DocumentVersionEntity,
): Promise<DocumentVersion> {
  return {
    id: documentVersion.id,
    previousVersionId: documentVersion.previousVersionId,
    collectionVersionId: documentVersion.collectionVersionId,
    content: documentVersion.content,
    contentSummary: await javascriptSandbox.executeSyncFunction(
      collectionVersion.settings.contentSummaryGetter,
      [documentVersion.content],
    ),
    createdAt: documentVersion.createdAt,
  };
}
