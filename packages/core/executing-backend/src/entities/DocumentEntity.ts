import type { CollectionId, DocumentId } from "@superego/backend";

type DocumentEntity = {
  id: DocumentId;
  collectionId: CollectionId;
  createdAt: Date;
} & (
  | {
      remoteId: null;
      remoteUrl: null;
      latestRemoteDocument: null;
    }
  | {
      remoteId: string;
      remoteUrl: string | null;
      latestRemoteDocument: any;
    }
);
export default DocumentEntity;
