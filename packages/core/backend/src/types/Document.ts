import type CollectionId from "../ids/CollectionId.js";
import type DocumentId from "../ids/DocumentId.js";
import type DocumentVersion from "./DocumentVersion.js";

type Document = {
  id: DocumentId;
  collectionId: CollectionId;
  latestVersion: DocumentVersion;
  createdAt: Date;
} & (
  | {
      /** Id of the remote counterpart of this document. */
      remoteId: null;
      /** Url of the remote counterpart of this document. */
      remoteUrl: null;
    }
  | {
      /** Id of the remote counterpart of this document. */
      remoteId: string;
      /** Url of the remote counterpart of this document. */
      remoteUrl: string | null;
    }
);
export default Document;
