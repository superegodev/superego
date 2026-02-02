import type {
  CollectionId,
  CollectionVersionId,
  ConversationId,
  DocumentId,
  DocumentVersion,
  DocumentVersionCreator,
  DocumentVersionId,
} from "@superego/backend";
import type {
  DocumentVersionEntity,
  MinimalDocumentVersionEntity,
} from "@superego/executing-backend";
import type { DiffPatcher } from "jsondiffpatch";

type SqliteDocumentVersion = {
  id: DocumentVersionId;
  remote_id: string | null;
  previous_version_id: DocumentVersionId | null;
  collection_id: CollectionId;
  document_id: DocumentId;
  collection_version_id: CollectionVersionId;
  conversation_id: ConversationId | null;
  /**
   * JSON. It's a jsondiffpatch delta or `null` when there is no delta from the
   * previous version.
   */
  content_delta: string | null;
  /** JSON. Array of contentBlockingKeys. */
  content_blocking_keys: string | null;
  /** JSON. Content summary result. */
  content_summary: string;
  /** JSON. Array of DocumentRef objects. */
  referenced_documents: string;
  created_by: DocumentVersionCreator;
  /** ISO 8601 */
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
    remoteId: documentVersion.remote_id,
    previousVersionId: documentVersion.previous_version_id,
    collectionId: documentVersion.collection_id,
    documentId: documentVersion.document_id,
    collectionVersionId: documentVersion.collection_version_id,
    conversationId: documentVersion.conversation_id,
    content:
      documentVersion.is_latest === 1
        ? JSON.parse(documentVersion.content_snapshot)
        : makeContent(documentVersion.id, allDocumentVersions!, jdp!),
    contentBlockingKeys: documentVersion.content_blocking_keys
      ? JSON.parse(documentVersion.content_blocking_keys)
      : null,
    contentSummary: JSON.parse(
      documentVersion.content_summary,
    ) as DocumentVersion["contentSummary"],
    referencedDocuments: JSON.parse(documentVersion.referenced_documents),
    createdBy: documentVersion.created_by,
    createdAt: new Date(documentVersion.created_at),
  } as DocumentVersionEntity;
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
    if (currentDocumentVersion.content_delta !== null) {
      deltas.push(JSON.parse(currentDocumentVersion.content_delta));
    }
    if (currentDocumentVersion.previous_version_id) {
      currentDocumentVersion =
        documentVersionsById[currentDocumentVersion.previous_version_id]!;
    } else {
      break;
    }
  }

  return deltas.reduceRight((content, delta) => jdp.patch(content, delta), {});
}

export function toMinimalEntity(
  documentVersion: SqliteDocumentVersion,
): MinimalDocumentVersionEntity {
  return {
    id: documentVersion.id,
    remoteId: documentVersion.remote_id,
    previousVersionId: documentVersion.previous_version_id,
    collectionId: documentVersion.collection_id,
    documentId: documentVersion.document_id,
    collectionVersionId: documentVersion.collection_version_id,
    conversationId: documentVersion.conversation_id,
    referencedDocuments: JSON.parse(documentVersion.referenced_documents),
    createdBy: documentVersion.created_by,
    createdAt: new Date(documentVersion.created_at),
  };
}
