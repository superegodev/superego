import type { DatabaseSync } from "node:sqlite";
import type { CollectionId, DocumentId } from "@superego/backend";
import type {
  DocumentEntity,
  DocumentRepository,
} from "@superego/executing-backend";
import type SqliteDocument from "../types/SqliteDocument.js";
import { toEntity } from "../types/SqliteDocument.js";

const table = "documents";

export default class SqliteDocumentRepository implements DocumentRepository {
  constructor(private db: DatabaseSync) {}

  async insert(document: DocumentEntity): Promise<void> {
    this.db
      .prepare(`
        INSERT INTO "${table}"
          ("id", "remote_id", "collection_id", "created_at")
        VALUES
          (?, ?, ?, ?)
      `)
      .run(
        document.id,
        document.remoteId,
        document.collectionId,
        document.createdAt.toISOString(),
      );
  }

  async delete(id: DocumentId): Promise<DocumentId> {
    this.db.prepare(`DELETE FROM "${table}" WHERE "id" = ?`).run(id);
    return id;
  }

  async deleteAllWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<DocumentId[]> {
    const result = this.db
      .prepare(
        `DELETE FROM "${table}" WHERE "collection_id" = ? RETURNING "id"`,
      )
      .all(collectionId) as { id: DocumentId }[];
    return result.map(({ id }) => id);
  }

  async exists(id: DocumentId): Promise<boolean> {
    const result = this.db
      .prepare(`SELECT 1 FROM "${table}" WHERE "id" = ?`)
      .get(id) as 1 | undefined;
    return result !== undefined;
  }

  async oneExistsWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<boolean> {
    const result = this.db
      .prepare(`SELECT 1 FROM "${table}" WHERE "collection_id" = ?`)
      .get(collectionId) as 1 | undefined;
    return result !== undefined;
  }

  async find(id: DocumentId): Promise<DocumentEntity | null> {
    const document = this.db
      .prepare(`SELECT * FROM "${table}" WHERE "id" = ?`)
      .get(id) as SqliteDocument | undefined;
    return document ? toEntity(document) : null;
  }

  async findWhereCollectionIdAndRemoteIdEq(
    collectionId: CollectionId,
    remoteId: string,
  ): Promise<DocumentEntity | null> {
    const document = this.db
      .prepare(
        `SELECT * FROM "${table}" WHERE "collection_id" = ? AND "remote_id" = ?`,
      )
      .get(collectionId, remoteId) as SqliteDocument | undefined;
    return document ? toEntity(document) : null;
  }

  async findAllWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<DocumentEntity[]> {
    const documents = this.db
      .prepare(`SELECT * FROM "${table}" WHERE "collection_id" = ?`)
      .all(collectionId) as any as SqliteDocument[];
    return documents.map(toEntity);
  }
}
