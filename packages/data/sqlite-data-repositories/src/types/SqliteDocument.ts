import { decode } from "@msgpack/msgpack";
import type { CollectionId, DocumentId } from "@superego/backend";
import type { DocumentEntity } from "@superego/executing-backend";

export default interface SqliteDocument {
  id: DocumentId;
  remote_id: string | null;
  remote_url: string | null;
  /** MessagePack */
  latest_remote_document: Buffer | null;
  collection_id: CollectionId;
  /** ISO8601 */
  created_at: string;
}

export function toEntity(document: SqliteDocument): DocumentEntity {
  return {
    id: document.id,
    remoteId: document.remote_id,
    remoteUrl: document.remote_url,
    latestRemoteDocument: document.latest_remote_document
      ? (decode(document.latest_remote_document) as any)
      : null,
    collectionId: document.collection_id,
    createdAt: new Date(document.created_at),
  } as DocumentEntity;
}
