import type { DatabaseSync } from "node:sqlite";
import type {
  CollectionId,
  DocumentId,
  DocumentVersionId,
} from "@superego/backend";
import type {
  DocumentVersionEntity,
  DocumentVersionRepository,
  MinimalDocumentVersionEntity,
} from "@superego/executing-backend";
import { create } from "jsondiffpatch";
import type SqliteDocumentVersion from "../types/SqliteDocumentVersion.js";
import { toEntity, toMinimalEntity } from "../types/SqliteDocumentVersion.js";

const documentVersionsTable = "document_versions";
const documentVersionContentBlockingKeysTable =
  "document_version_content_blocking_keys";

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
          UPDATE "${documentVersionsTable}"
          SET "is_latest" = 0, "content_snapshot" = null
          WHERE "document_id" = ? AND "is_latest" = 1
        `)
        .run(documentVersion.documentId);
    }
    this.db
      .prepare(`
        INSERT INTO "${documentVersionsTable}"
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
            "content_blocking_keys",
            "referenced_documents",
            "created_by",
            "created_at",
            "is_latest"
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        documentVersion.contentBlockingKeys
          ? JSON.stringify(documentVersion.contentBlockingKeys)
          : null,
        JSON.stringify(documentVersion.referencedDocuments),
        documentVersion.createdBy,
        documentVersion.createdAt.toISOString(),
        1,
      );
    // Insert blocking keys into the "index" table.
    if (documentVersion.contentBlockingKeys !== null) {
      const insertBlockingKey = this.db.prepare(`
        INSERT INTO "${documentVersionContentBlockingKeysTable}"
          ("collection_id", "document_version_id", "blocking_key")
        VALUES
          (?, ?, ?)
      `);
      for (const blockingKey of documentVersion.contentBlockingKeys) {
        insertBlockingKey.run(
          documentVersion.collectionId,
          documentVersion.id,
          blockingKey,
        );
      }
    }
  }

  async deleteAllWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<DocumentVersionId[]> {
    const result = this.db
      .prepare(
        `DELETE FROM "${documentVersionsTable}" WHERE "collection_id" = ? RETURNING "id"`,
      )
      .all(collectionId) as { id: DocumentVersionId }[];
    // documentVersionContentBlockingKeysTable rows are deleted ON CASCADE.
    return result.map(({ id }) => id);
  }

  async deleteAllWhereDocumentIdEq(
    documentId: DocumentId,
  ): Promise<DocumentVersionId[]> {
    const result = this.db
      .prepare(
        `DELETE FROM "${documentVersionsTable}" WHERE "document_id" = ? RETURNING "id"`,
      )
      .all(documentId) as { id: DocumentVersionId }[];
    // documentVersionContentBlockingKeysTable rows are deleted ON CASCADE.
    return result.map(({ id }) => id);
  }

  async find(id: DocumentVersionId): Promise<DocumentVersionEntity | null> {
    const documentVersion = this.db
      .prepare(`SELECT * FROM "${documentVersionsTable}" WHERE "id" = ?`)
      .get(id) as SqliteDocumentVersion | undefined;
    if (!documentVersion) {
      return null;
    }
    if (documentVersion.is_latest === 1) {
      return toEntity(documentVersion);
    }
    const allDocumentVersions = this.db
      .prepare(
        `SELECT * FROM "${documentVersionsTable}" WHERE "document_id" = ?`,
      )
      .all(documentVersion.document_id) as SqliteDocumentVersion[];
    return toEntity(documentVersion, allDocumentVersions, jdp);
  }

  async findLatestWhereDocumentIdEq(
    documentId: DocumentId,
  ): Promise<DocumentVersionEntity | null> {
    const documentVersion = this.db
      .prepare(
        `SELECT * FROM "${documentVersionsTable}" WHERE "document_id" = ? AND "is_latest" = 1`,
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
        `SELECT * FROM "${documentVersionsTable}" WHERE "collection_id" = ? AND "is_latest" = 1`,
      )
      .all(collectionId) as (SqliteDocumentVersion & { is_latest: 1 })[];
    return documentVersions.map(toEntity);
  }

  async findAllWhereDocumentIdEq(
    documentId: DocumentId,
  ): Promise<MinimalDocumentVersionEntity[]> {
    const allDocumentVersions = this.db
      .prepare(
        `SELECT * FROM "${documentVersionsTable}" WHERE "document_id" = ? ORDER BY "created_at" DESC`,
      )
      .all(documentId) as SqliteDocumentVersion[];
    return allDocumentVersions.map(toMinimalEntity);
  }

  async findAllLatestWhereReferencedDocumentsContains(
    collectionId: CollectionId,
    documentId: DocumentId,
  ): Promise<DocumentVersionEntity[]> {
    const documentVersions = this.db
      .prepare(`
        SELECT * FROM "${documentVersionsTable}"
        WHERE "is_latest" = 1
        AND EXISTS (
          SELECT 1 FROM json_each("referenced_documents")
          WHERE json_extract(value, '$.collectionId') = ?
          AND json_extract(value, '$.documentId') = ?
        )
      `)
      .all(collectionId, documentId) as (SqliteDocumentVersion & {
      is_latest: 1;
    })[];
    return documentVersions.map(toEntity);
  }

  async findAnyLatestWhereCollectionIdEqAndContentBlockingKeysOverlap(
    collectionId: CollectionId,
    contentBlockingKeys: string[],
  ): Promise<DocumentVersionEntity | null> {
    if (contentBlockingKeys.length === 0) {
      return null;
    }
    const placeholders = contentBlockingKeys.map(() => "?").join(", ");
    const documentVersion = this.db
      .prepare(`
        SELECT dv.* FROM "${documentVersionsTable}" dv
        JOIN "${documentVersionContentBlockingKeysTable}" dvcbk
          ON dv."id" = dvcbk."document_version_id"
        WHERE dvcbk."collection_id" = ?
        AND dvcbk."blocking_key" IN (${placeholders})
        AND dv."is_latest" = 1
        LIMIT 1
      `)
      .get(collectionId, ...contentBlockingKeys) as
      | (SqliteDocumentVersion & { is_latest: 1 })
      | undefined;
    return documentVersion ? toEntity(documentVersion) : null;
  }
}
