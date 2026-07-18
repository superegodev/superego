import type {
  CollectionId,
  CollectionVersionId,
  DocumentId,
  DocumentVersionId,
} from "@superego/backend";
import type {
  DocumentVersionEntity,
  DocumentVersionRepository,
  MinimalDocumentVersionEntity,
} from "@superego/executing-backend";
import { memoize } from "es-toolkit";
import { create } from "jsondiffpatch";
import type TursoDatabase from "../TursoDatabase.js";
import type TursoDocumentVersion from "../types/TursoDocumentVersion.js";
import { toEntity, toMinimalEntity } from "../types/TursoDocumentVersion.js";

const documentVersionsTable = "document_versions";
const documentVersionContentBlockingKeysTable =
  "document_version_content_blocking_keys";

const jdp = create({ omitRemovedValues: true });

export default class TursoDocumentVersionRepository implements DocumentVersionRepository {
  constructor(private db: TursoDatabase) {}

  async insert(documentVersion: DocumentVersionEntity): Promise<void> {
    const previousDocumentVersion = await this.findLatestWhereDocumentIdEq(
      documentVersion.documentId,
    );
    if (previousDocumentVersion) {
      await this.db
        .prepare(`
          UPDATE "${documentVersionsTable}"
          SET "is_latest" = 0, "content_snapshot" = null
          WHERE "document_id" = ? AND "is_latest" = 1
        `)
        .run(documentVersion.documentId);
    }
    await this.db
      .prepare(`
        INSERT INTO "${documentVersionsTable}"
          (
            "id",
            "previous_version_id",
            "collection_id",
            "document_id",
            "collection_version_id",
            "conversation_id",
            "content_delta",
            "content_snapshot",
            "content_blocking_keys",
            "content_summary",
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
        JSON.stringify(documentVersion.contentSummary),
        JSON.stringify(documentVersion.referencedDocuments),
        documentVersion.createdBy,
        documentVersion.createdAt.toISOString(),
        1,
      );
    // Insert blocking keys into the "index" table.
    await this.insertContentBlockingKeys(
      documentVersion.collectionId,
      documentVersion.id,
      documentVersion.contentBlockingKeys,
    );
    // Delete content blocking keys of previous versions from the index table.
    // We only need to keep blocking keys for the latest version of each
    // document.
    if (previousDocumentVersion) {
      await this.deleteContentBlockingKeys(previousDocumentVersion.id);
    }
  }

  async updateContentBlockingKeys(
    id: DocumentVersionId,
    contentBlockingKeys: DocumentVersionEntity["contentBlockingKeys"],
  ): Promise<void> {
    await this.db
      .prepare(
        `UPDATE "${documentVersionsTable}" SET "content_blocking_keys" = ? WHERE "id" = ?`,
      )
      .run(
        contentBlockingKeys ? JSON.stringify(contentBlockingKeys) : null,
        id,
      );

    // Only update the index table for the latest version.
    const documentVersion = (await this.db
      .prepare(
        `SELECT "collection_id" FROM "${documentVersionsTable}" WHERE "id" = ? AND "is_latest" = 1`,
      )
      .get(id)) as { collection_id: CollectionId } | undefined;
    if (!documentVersion) {
      return;
    }
    await this.deleteContentBlockingKeys(id);
    await this.insertContentBlockingKeys(
      documentVersion.collection_id,
      id,
      contentBlockingKeys,
    );
  }

  async updateContentSummary(
    id: DocumentVersionId,
    contentSummary: DocumentVersionEntity["contentSummary"],
  ): Promise<void> {
    await this.db
      .prepare(
        `UPDATE "${documentVersionsTable}" SET "content_summary" = ? WHERE "id" = ?`,
      )
      .run(JSON.stringify(contentSummary), id);
  }

  async deleteAllWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<DocumentVersionId[]> {
    const result = (await this.db
      .prepare(
        `SELECT "id" FROM "${documentVersionsTable}" WHERE "collection_id" = ?`,
      )
      .all(collectionId)) as { id: DocumentVersionId }[];
    await this.db
      .prepare(
        `DELETE FROM "${documentVersionsTable}" WHERE "collection_id" = ?`,
      )
      .run(collectionId);
    // documentVersionContentBlockingKeysTable rows are deleted ON CASCADE.
    return result.map(({ id }) => id);
  }

  async deleteAllWhereDocumentIdEq(
    documentId: DocumentId,
  ): Promise<DocumentVersionId[]> {
    const result = (await this.db
      .prepare(
        `SELECT "id" FROM "${documentVersionsTable}" WHERE "document_id" = ?`,
      )
      .all(documentId)) as { id: DocumentVersionId }[];
    await this.db
      .prepare(`DELETE FROM "${documentVersionsTable}" WHERE "document_id" = ?`)
      .run(documentId);
    // documentVersionContentBlockingKeysTable rows are deleted ON CASCADE.
    return result.map(({ id }) => id);
  }

  async find(id: DocumentVersionId): Promise<DocumentVersionEntity | null> {
    const documentVersion = (await this.db
      .prepare(`SELECT * FROM "${documentVersionsTable}" WHERE "id" = ?`)
      .get(id)) as TursoDocumentVersion | undefined;
    if (!documentVersion) {
      return null;
    }
    if (documentVersion.is_latest === 1) {
      return toEntity(documentVersion);
    }
    const allDocumentVersions = (await this.db
      .prepare(
        `SELECT * FROM "${documentVersionsTable}" WHERE "document_id" = ?`,
      )
      .all(documentVersion.document_id)) as TursoDocumentVersion[];
    return toEntity(documentVersion, allDocumentVersions, jdp);
  }

  async findLatestWhereDocumentIdEq(
    documentId: DocumentId,
  ): Promise<DocumentVersionEntity | null> {
    const documentVersion = (await this.db
      .prepare(
        `SELECT * FROM "${documentVersionsTable}" WHERE "document_id" = ? AND "is_latest" = 1`,
      )
      .get(documentId)) as
      | (TursoDocumentVersion & { is_latest: 1 })
      | undefined;
    return documentVersion ? toEntity(documentVersion) : null;
  }

  async findAllWhereDocumentIdEq(
    documentId: DocumentId,
  ): Promise<MinimalDocumentVersionEntity[]> {
    const allDocumentVersions = (await this.db
      .prepare(
        `SELECT * FROM "${documentVersionsTable}" WHERE "document_id" = ? ORDER BY "created_at" DESC`,
      )
      .all(documentId)) as TursoDocumentVersion[];
    return allDocumentVersions.map(toMinimalEntity);
  }

  async findAllWhereCollectionVersionIdEq(
    collectionVersionId: CollectionVersionId,
  ): Promise<DocumentVersionEntity[]> {
    const documentVersions = (await this.db
      .prepare(
        `SELECT * FROM "${documentVersionsTable}" WHERE "collection_version_id" = ?`,
      )
      .all(collectionVersionId)) as TursoDocumentVersion[];

    const findAllByDocumentIdStatement = await this.db.prepare(
      `SELECT * FROM "${documentVersionsTable}" WHERE "document_id" = ?`,
    );
    const getAllVersionsForDocument = memoize(
      async (documentId: string) =>
        (await findAllByDocumentIdStatement.all(
          documentId,
        )) as TursoDocumentVersion[],
    );

    return Promise.all(
      documentVersions.map(async (documentVersion) =>
        documentVersion.is_latest === 1
          ? toEntity(documentVersion)
          : toEntity(
              documentVersion,
              await getAllVersionsForDocument(documentVersion.document_id),
              jdp,
            ),
      ),
    );
  }

  async findAllLatestsWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<DocumentVersionEntity[]> {
    const documentVersions = (await this.db
      .prepare(
        `SELECT * FROM "${documentVersionsTable}" WHERE "collection_id" = ? AND "is_latest" = 1`,
      )
      .all(collectionId)) as (TursoDocumentVersion & { is_latest: 1 })[];
    return documentVersions.map(toEntity);
  }

  async findAllLatestWhereReferencedDocumentsContains(
    collectionId: CollectionId,
    documentId: DocumentId,
  ): Promise<DocumentVersionEntity[]> {
    const documentVersions = (await this.db
      .prepare(`
        SELECT * FROM "${documentVersionsTable}"
        WHERE "is_latest" = 1
        AND EXISTS (
          SELECT 1 FROM json_each("referenced_documents")
          WHERE json_extract(value, '$.collectionId') = ?
          AND json_extract(value, '$.documentId') = ?
        )
      `)
      .all(collectionId, documentId)) as (TursoDocumentVersion & {
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
    const documentVersion = (await this.db
      .prepare(`
        SELECT dv.* FROM "${documentVersionsTable}" dv
        JOIN "${documentVersionContentBlockingKeysTable}" dvcbk
          ON dv."id" = dvcbk."document_version_id"
        WHERE dvcbk."collection_id" = ?
        AND dvcbk."blocking_key" IN (${placeholders})
        AND dv."is_latest" = 1
        LIMIT 1
      `)
      .get(collectionId, ...contentBlockingKeys)) as
      | (TursoDocumentVersion & { is_latest: 1 })
      | undefined;
    return documentVersion ? toEntity(documentVersion) : null;
  }

  private async insertContentBlockingKeys(
    collectionId: CollectionId,
    documentVersionId: DocumentVersionId,
    contentBlockingKeys: string[] | null,
  ): Promise<void> {
    if (contentBlockingKeys === null) {
      return;
    }
    const insertBlockingKey = await this.db.prepare(`
      INSERT INTO "${documentVersionContentBlockingKeysTable}"
        ("collection_id", "document_version_id", "blocking_key")
      VALUES
        (?, ?, ?)
    `);
    for (const blockingKey of contentBlockingKeys) {
      await insertBlockingKey.run(collectionId, documentVersionId, blockingKey);
    }
  }

  private async deleteContentBlockingKeys(
    documentVersionId: DocumentVersionId,
  ): Promise<void> {
    await this.db
      .prepare(
        `DELETE FROM "${documentVersionContentBlockingKeysTable}" WHERE "document_version_id" = ?`,
      )
      .run(documentVersionId);
  }
}
