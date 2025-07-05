import type {
  CollectionId,
  CollectionVersionId,
  DocumentId,
  DocumentVersionId,
} from "@superego/backend";
import type { DocumentVersionEntity } from "@superego/executing-backend";

type SqliteDocumentVersion = {
  id: DocumentVersionId;
  previous_version_id: DocumentVersionId | null;
  collection_id: CollectionId;
  document_id: DocumentId;
  collection_version_id: CollectionVersionId;
  /**
   * JSON. It's a jsondiffpatch delta or `null` when there is no delta from the
   * previous version.
   */
  content_delta: string | null;
  /** ISO8601 */
  created_at: string;
  is_latest: 0 | 1;
} & (
  | {
      is_latest: 0;
      content_snapshot: null;
    }
  | {
      is_latest: 1;
      /** JSON */
      content_snapshot: string;
    }
);
export default SqliteDocumentVersion;

export function toEntity(
  documentVersion: SqliteDocumentVersion & { is_latest: 1 },
): DocumentVersionEntity {
  return {
    id: documentVersion.id,
    previousVersionId: documentVersion.previous_version_id,
    collectionId: documentVersion.collection_id,
    documentId: documentVersion.document_id,
    collectionVersionId: documentVersion.collection_version_id,
    content: JSON.parse(documentVersion.content_snapshot),
    createdAt: new Date(documentVersion.created_at),
  };
}
