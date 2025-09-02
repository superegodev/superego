import type {
  CollectionId,
  CollectionVersionId,
  DocumentId,
  DocumentVersionId,
} from "@superego/backend";
import type { DocumentVersionEntity } from "@superego/executing-backend";
import type { DiffPatcher } from "jsondiffpatch";

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
): DocumentVersionEntity;
export function toEntity(
  documentVersion: SqliteDocumentVersion & { is_latest: 0 },
  allDocumentVersions: SqliteDocumentVersion[],
  jdp: DiffPatcher,
): DocumentVersionEntity;
export function toEntity(
  documentVersion: SqliteDocumentVersion,
  allDocumentVersions?: SqliteDocumentVersion[],
  jdp?: DiffPatcher,
): DocumentVersionEntity {
  return {
    id: documentVersion.id,
    previousVersionId: documentVersion.previous_version_id,
    collectionId: documentVersion.collection_id,
    documentId: documentVersion.document_id,
    collectionVersionId: documentVersion.collection_version_id,
    content:
      documentVersion.is_latest === 1
        ? JSON.parse(documentVersion.content_snapshot)
        : makeContent(documentVersion.id, allDocumentVersions!, jdp!),
    createdAt: new Date(documentVersion.created_at),
  };
}

/** Makes the specified DocumentVersion content by applying all deltas. */
function makeContent(
  id: DocumentVersionId,
  allDocumentVersions: SqliteDocumentVersion[],
  jdp: DiffPatcher,
): any {
  const documentVersionsById: Record<DocumentVersionId, SqliteDocumentVersion> =
    {};
  for (const documentVersion of allDocumentVersions) {
    documentVersionsById[documentVersion.id] = documentVersion;
  }

  const deltas: any[] = [];
  let currentDocumentVersion = documentVersionsById[id]!;
  for (;;) {
    deltas.push(JSON.parse(currentDocumentVersion.content_delta!));
    if (currentDocumentVersion.previous_version_id) {
      currentDocumentVersion =
        documentVersionsById[currentDocumentVersion.previous_version_id]!;
    } else {
      break;
    }
  }

  return deltas.reduceRight((content, delta) => jdp.patch(content, delta), {});
}
