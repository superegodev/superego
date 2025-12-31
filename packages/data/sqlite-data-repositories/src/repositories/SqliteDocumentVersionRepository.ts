import type { DatabaseSync } from "node:sqlite";
import type {
  CollectionId,
  DocumentId,
  DocumentVersionId,
} from "@superego/backend";
import type {
  DocumentVersionEntity,
  DocumentVersionRepository,
} from "@superego/executing-backend";
import { create } from "jsondiffpatch";
import type SqliteDocumentVersion from "../types/SqliteDocumentVersion.js";
import { toEntity } from "../types/SqliteDocumentVersion.js";

const table = "document_versions";

const jdp = create({ omitRemovedValues: true });

export default class SqliteDocumentVersionRepository
  implements DocumentVersionRepository
{
  constructor(private db: DatabaseSync) {}

  async insert(documentVersion: DocumentVersionEntity): Promise<void> {
    const previousDocumentVersion = await this.findLatestWhereDocumentIdEq(
      documentVersion.documentId,
    );
    if (previousDocumentVersion) {
      this.db
        .prepare(`
          UPDATE "${table}"
          SET "is_latest" = 0, "content_snapshot" = null
          WHERE "document_id" = ? AND "is_latest" = 1
        `)
        .run(documentVersion.documentId);
    }
    this.db
      .prepare(`
        INSERT INTO "${table}"
          (
            "id",
            "remote_id",
            "previous_version_id",
            "collection_id",
            "document_id",
            "collection_version_id",
            "conversation_id",
            "content_delta",
            "content_snapshot",
            "created_by",
            "created_at",
            "is_latest"
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        documentVersion.id,
        documentVersion.remoteId,
        documentVersion.previousVersionId,
        documentVersion.collectionId,
        documentVersion.documentId,
        documentVersion.collectionVersionId,
        documentVersion.conversationId,
        JSON.stringify(
          jdp.diff(previousDocumentVersion?.content, documentVersion.content),
        ) ?? null,
        JSON.stringify(documentVersion.content),
        documentVersion.createdBy,
        documentVersion.createdAt.toISOString(),
        1,
      );
  }

  async deleteAllWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<DocumentVersionId[]> {
    const result = this.db
      .prepare(
        `DELETE FROM "${table}" WHERE "collection_id" = ? RETURNING "id"`,
      )
      .all(collectionId) as { id: DocumentVersionId }[];
    return result.map(({ id }) => id);
  }

  async deleteAllWhereDocumentIdEq(
    documentId: DocumentId,
  ): Promise<DocumentVersionId[]> {
    const result = this.db
      .prepare(`DELETE FROM "${table}" WHERE "document_id" = ? RETURNING "id"`)
      .all(documentId) as { id: DocumentVersionId }[];
    return result.map(({ id }) => id);
  }

  async find(id: DocumentVersionId): Promise<DocumentVersionEntity | null> {
    const documentVersion = this.db
      .prepare(`SELECT * FROM "${table}" WHERE "id" = ?`)
      .get(id) as SqliteDocumentVersion | undefined;
    if (!documentVersion) {
      return null;
    }
    if (documentVersion?.is_latest === 1) {
      return toEntity(documentVersion);
    }
    const allDocumentVersions = this.db
      .prepare(`SELECT * FROM "${table}"`)
      .all() as SqliteDocumentVersion[];
    return toEntity(documentVersion, allDocumentVersions, jdp);
  }

  async findLatestWhereDocumentIdEq(
    documentId: DocumentId,
  ): Promise<DocumentVersionEntity | null> {
    const documentVersion = this.db
      .prepare(
        `SELECT * FROM "${table}" WHERE "document_id" = ? AND "is_latest" = 1`,
      )
      .get(documentId) as
      | (SqliteDocumentVersion & { is_latest: 1 })
      | undefined;
    return documentVersion ? toEntity(documentVersion) : null;
  }

  async findAllLatestsWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<DocumentVersionEntity[]> {
    const documentVersions = this.db
      .prepare(
        `SELECT * FROM "${table}" WHERE "collection_id" = ? AND "is_latest" = 1`,
      )
      .all(collectionId) as (SqliteDocumentVersion & { is_latest: 1 })[];
    return documentVersions.map(toEntity);
  }
}
