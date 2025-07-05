import type { Document } from "@superego/backend";
import type CollectionVersionEntity from "../entities/CollectionVersionEntity.js";
import type DocumentEntity from "../entities/DocumentEntity.js";
import type DocumentVersionEntity from "../entities/DocumentVersionEntity.js";
import type JavascriptSandbox from "../requirements/JavascriptSandbox.js";
import makeDocumentVersion from "./makeDocumentVersion.js";

export default async function makeDocument(
  javascriptSandbox: JavascriptSandbox,
  collectionVersion: CollectionVersionEntity,
  document: DocumentEntity,
  latestVersion: DocumentVersionEntity,
): Promise<Document> {
  return {
    id: document.id,
    collectionId: document.collectionId,
    latestVersion: await makeDocumentVersion(
      javascriptSandbox,
      collectionVersion,
      latestVersion,
    ),
    createdAt: document.createdAt,
  };
}
