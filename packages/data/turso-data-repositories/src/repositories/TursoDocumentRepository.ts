import type { CollectionId, DocumentId } from "@superego/backend";
import type {
  DocumentEntity,
  DocumentRepository,
} from "@superego/executing-backend";
import type TursoDatabase from "../TursoDatabase.js";
import type TursoDocument from "../types/TursoDocument.js";
import { toEntity } from "../types/TursoDocument.js";

const table = "documents";

export default class TursoDocumentRepository implements DocumentRepository {
  constructor(private db: TursoDatabase) {}

  async insert(document: DocumentEntity): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO "${table}"
          (
            "id",
            "collection_id",
            "created_at"
          )
        VALUES
          (?, ?, ?)
      `)
      .run(
        document.id,
        document.collectionId,
        document.createdAt.toISOString(),
      );
  }

  async replace(document: DocumentEntity): Promise<void> {
    await this.db
      .prepare(`
          UPDATE "${table}"
          SET
            "collection_id" = ?,
            "created_at" = ?
          WHERE "id" = ?
        `)
      .run(
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
      .prepare(`SELECT "id" FROM "${table}" WHERE "collection_id" = ?`)
      .all(collectionId)) as { id: DocumentId }[];
    await this.db
      .prepare(`DELETE FROM "${table}" WHERE "collection_id" = ?`)
      .run(collectionId);
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
      .get(id)) as TursoDocument | undefined;
    return document ? toEntity(document) : null;
  }

  async findAllWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<DocumentEntity[]> {
    const documents = (await this.db
      .prepare(`SELECT * FROM "${table}" WHERE "collection_id" = ?`)
      .all(collectionId)) as TursoDocument[];
    return documents.map(toEntity);
  }
}
