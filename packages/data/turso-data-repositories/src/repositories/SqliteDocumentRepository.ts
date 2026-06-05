import { encode } from "@msgpack/msgpack";
import type { CollectionId, DocumentId } from "@superego/backend";
import type {
  DocumentEntity,
  DocumentRepository,
} from "@superego/executing-backend";
import type AsyncSqliteDatabase from "../AsyncSqliteDatabase.js";
import type SqliteDocument from "../types/SqliteDocument.js";
import { toEntity } from "../types/SqliteDocument.js";

const table = "documents";

export default class SqliteDocumentRepository implements DocumentRepository {
  constructor(private db: AsyncSqliteDatabase) {}

  async insert(document: DocumentEntity): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO "${table}"
          (
            "id",
            "remote_id",
            "remote_url",
            "latest_remote_document",
            "collection_id",
            "created_at"
          )
        VALUES
          (?, ?, ?, ?, ?, ?)
      `)
      .run(
        document.id,
        document.remoteId,
        document.remoteUrl,
        document.latestRemoteDocument
          ? encode(document.latestRemoteDocument)
          : null,
        document.collectionId,
        document.createdAt.toISOString(),
      );
  }

  async replace(document: DocumentEntity): Promise<void> {
    await this.db
      .prepare(`
          UPDATE "${table}"
          SET
            "remote_id" = ?,
            "remote_url" = ?,
            "latest_remote_document" = ?,
            "collection_id" = ?,
            "created_at" = ?
          WHERE "id" = ?
        `)
      .run(
        document.remoteId,
        document.remoteUrl,
        document.latestRemoteDocument
          ? encode(document.latestRemoteDocument)
          : null,
        document.collectionId,
        document.createdAt.toISOString(),
        document.id,
      );
  }

  async delete(id: DocumentId): Promise<DocumentId> {
    await this.db.prepare(`DELETE FROM "${table}" WHERE "id" = ?`).run(id);
    return id;
  }

  async deleteAllWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<DocumentId[]> {
    const result = (await this.db
      .prepare(
        `DELETE FROM "${table}" WHERE "collection_id" = ? RETURNING "id" AS id`,
      )
      .all(collectionId)) as { id: DocumentId }[];
    return result.map(({ id }) => id);
  }

  async exists(id: DocumentId): Promise<boolean> {
    const result = (await this.db
      .prepare(`SELECT 1 FROM "${table}" WHERE "id" = ?`)
      .get(id)) as 1 | undefined;
    return result !== undefined;
  }

  async oneExistsWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<boolean> {
    const result = (await this.db
      .prepare(`SELECT 1 FROM "${table}" WHERE "collection_id" = ?`)
      .get(collectionId)) as 1 | undefined;
    return result !== undefined;
  }

  async find(id: DocumentId): Promise<DocumentEntity | null> {
    const document = (await this.db
      .prepare(`SELECT * FROM "${table}" WHERE "id" = ?`)
      .get(id)) as SqliteDocument | undefined;
    return document ? toEntity(document) : null;
  }

  async findWhereCollectionIdAndRemoteIdEq(
    collectionId: CollectionId,
    remoteId: string,
  ): Promise<DocumentEntity | null> {
    const document = (await this.db
      .prepare(
        `SELECT * FROM "${table}" WHERE "collection_id" = ? AND "remote_id" = ?`,
      )
      .get(collectionId, remoteId)) as SqliteDocument | undefined;
    return document ? toEntity(document) : null;
  }

  async findAllWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<DocumentEntity[]> {
    const documents = (await this.db
      .prepare(`SELECT * FROM "${table}" WHERE "collection_id" = ?`)
      .all(collectionId)) as SqliteDocument[];
    return documents.map(toEntity);
  }
}
