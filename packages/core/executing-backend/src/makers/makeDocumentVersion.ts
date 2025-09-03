import type { DocumentVersion } from "@superego/backend";
import type CollectionVersionEntity from "../entities/CollectionVersionEntity.js";
import type DocumentVersionEntity from "../entities/DocumentVersionEntity.js";
import type JavascriptSandbox from "../requirements/JavascriptSandbox.js";
import mapNonEmptyArray from "../utils/mapNonEmptyArray.js";

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
    summaryProperties: await Promise.all(
      mapNonEmptyArray(
        collectionVersion.settings.summaryProperties,
        async ({ name, description, getter }) => {
          const result = await javascriptSandbox.executeSyncFunction(getter, [
            documentVersion.content,
          ]);
          return {
            name,
            description,
            value: result.success ? result.data : null,
            valueComputationError: !result.success ? result.error : null,
          };
        },
      ),
    ),
    createdAt: documentVersion.createdAt,
  };
}
