import type { DatabaseSync } from "node:sqlite";
import type { DocumentId, FileId } from "@superego/backend";
import type { FileEntity, FileRepository } from "@superego/executing-backend";
import type SqliteFile from "../types/SqliteFile.js";
import { toEntity } from "../types/SqliteFile.js";

const table = "files";

export default class SqliteFileRepository implements FileRepository {
  constructor(private db: DatabaseSync) {}

  async insertAll(
    filesWithContent: (FileEntity & { content: Uint8Array<ArrayBuffer> })[],
  ): Promise<void> {
    const insert = this.db.prepare(`
      INSERT INTO "${table}"
        (
          "id",
          "collection_id",
          "document_id",
          "created_with_document_version_id",
          "created_at",
          "content"
        )
      VALUES
        (?, ?, ?, ?, ?, ?)
    `);
    for (const file of filesWithContent) {
      insert.run(
        file.id,
        file.collectionId,
        file.documentId,
        file.createdWithDocumentVersionId,
        file.createdAt.toISOString(),
        Buffer.from(file.content),
      );
    }
  }

  async deleteAllWhereDocumentIdEq(documentId: DocumentId): Promise<FileId[]> {
    const result = this.db
      .prepare(`DELETE FROM "${table}" WHERE "document_id" = ? RETURNING "id"`)
      .all(documentId) as { id: FileId }[];
    return result.map(({ id }) => id);
  }

  async find(id: FileId): Promise<FileEntity | null> {
    const file = this.db
      .prepare(`
        SELECT
          "id",
          "collection_id",
          "document_id",
          "created_with_document_version_id",
          "created_at"
        FROM "${table}"
        WHERE "id" = ?;
      `)
      .get(id) as Omit<SqliteFile, "content"> | undefined;
    return file ? toEntity(file) : null;
  }

  async findAllWhereIdIn(ids: FileId[]): Promise<FileEntity[]> {
    if (ids.length === 0) {
      return [];
    }
    const placeholders = ids.map(() => "?").join(", ");
    const files = this.db
      .prepare(`
        SELECT
          "id",
          "collection_id",
          "document_id",
          "created_with_document_version_id",
          "created_at"
        FROM "${table}"
        WHERE "id" IN (${placeholders})
      `)
      .all(...ids) as Omit<SqliteFile, "content">[];
    return files.map(toEntity);
  }

  async getContent(id: FileId): Promise<Uint8Array<ArrayBuffer> | null> {
    const result = this.db
      .prepare(`SELECT "content" FROM "${table}" WHERE "id" = ?`)
      .get(id) as { content: Buffer } | undefined;
    return result ? new Uint8Array(result.content) : null;
  }
}
