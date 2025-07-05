import type CollectionId from "../ids/CollectionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type DocumentVersion from "./DocumentVersion.js";

export default interface Document<Content = Record<string, unknown>> {
  id: DocumentId;
  collectionId: CollectionId;
  latestVersion: DocumentVersion<Content>;
  createdAt: Date;
}
