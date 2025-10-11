import type CollectionId from "../ids/CollectionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type DocumentVersion from "./DocumentVersion.js";

export default interface Document {
  id: DocumentId;
  /** Id of the remote counterpart of this document. */
  remoteId: string | null;
  collectionId: CollectionId;
  latestVersion: DocumentVersion;
  createdAt: Date;
}
