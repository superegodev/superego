import type { DatabaseSync } from "node:sqlite";
import type { FileId } from "@superego/backend";
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
          "referenced_by",
          "created_at",
          "content"
        )
      VALUES
        (?, ?, ?, ?)
    `);
    for (const file of filesWithContent) {
      insert.run(
        file.id,
        JSON.stringify(file.referencedBy),
        file.createdAt.toISOString(),
        Buffer.from(file.content),
      );
    }
  }

  async addReferenceToAll(
    ids: FileId[],
    reference: FileEntity.Reference,
  ): Promise<void> {
    if (ids.length === 0) {
      return;
    }
    const placeholders = ids.map(() => "?").join(", ");
    const files = this.db
      .prepare(
        `SELECT "id", "referenced_by" FROM "${table}" WHERE "id" IN (${placeholders})`,
      )
      .all(...ids) as Pick<SqliteFile, "id" | "referenced_by">[];
    const update = this.db.prepare(
      `UPDATE "${table}" SET "referenced_by" = ? WHERE "id" = ?`,
    );
    for (const file of files) {
      const references = SqliteFileRepository.parseReferences(
        file.referenced_by,
      );
      if (!SqliteFileRepository.referencesIncludes(references, reference)) {
        references.push(reference);
        update.run(JSON.stringify(references), file.id);
      }
    }
  }

  async deleteReferenceFromAll(
    reference:
      | Omit<FileEntity.DocumentVersionReference, "documentVersionId">
      | FileEntity.ConversationReference,
  ): Promise<void> {
    const files = this.db
      .prepare(`SELECT "id", "referenced_by" FROM "${table}"`)
      .all() as Pick<SqliteFile, "id" | "referenced_by">[];
    const update = this.db.prepare(
      `UPDATE "${table}" SET "referenced_by" = ? WHERE "id" = ?`,
    );
    const del = this.db.prepare(`DELETE FROM "${table}" WHERE "id" = ?`);
    for (const file of files) {
      const references = SqliteFileRepository.parseReferences(
        file.referenced_by,
      );
      const updatedReferences = references.filter(
        (ref) =>
          !SqliteFileRepository.matchesReferenceForDeletion(ref, reference),
      );
      if (updatedReferences.length === 0) {
        del.run(file.id);
      } else if (updatedReferences.length !== references.length) {
        update.run(JSON.stringify(updatedReferences), file.id);
      }
    }
  }

  async find(id: FileId): Promise<FileEntity | null> {
    const file = this.db
      .prepare(`
        SELECT
          "id",
          "referenced_by",
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
          "referenced_by",
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

  private static parseReferences(json: string): FileEntity.Reference[] {
    return JSON.parse(json) as FileEntity.Reference[];
  }

  private static referencesIncludes(
    references: FileEntity.Reference[],
    reference: FileEntity.Reference,
  ): boolean {
    return references.some((ref) =>
      SqliteFileRepository.referencesAreEqual(ref, reference),
    );
  }

  private static referencesAreEqual(
    a: FileEntity.Reference,
    b: FileEntity.Reference,
  ): boolean {
    if (
      SqliteFileRepository.isConversationReference(a) &&
      SqliteFileRepository.isConversationReference(b)
    ) {
      return a.conversationId === b.conversationId;
    }
    if (
      SqliteFileRepository.isDocumentVersionReference(a) &&
      SqliteFileRepository.isDocumentVersionReference(b)
    ) {
      return (
        a.collectionId === b.collectionId &&
        a.documentId === b.documentId &&
        a.documentVersionId === b.documentVersionId
      );
    }
    return false;
  }

  private static matchesReferenceForDeletion(
    reference: FileEntity.Reference,
    target:
      | Omit<FileEntity.DocumentVersionReference, "documentVersionId">
      | FileEntity.ConversationReference,
  ): boolean {
    if (SqliteFileRepository.isConversationReference(target)) {
      return (
        SqliteFileRepository.isConversationReference(reference) &&
        reference.conversationId === target.conversationId
      );
    }
    return (
      SqliteFileRepository.isDocumentVersionReference(reference) &&
      reference.collectionId === target.collectionId &&
      reference.documentId === target.documentId
    );
  }

  private static isConversationReference(
    reference:
      | FileEntity.Reference
      | FileEntity.ConversationReference
      | Omit<FileEntity.DocumentVersionReference, "documentVersionId">,
  ): reference is FileEntity.ConversationReference {
    return Object.hasOwn(reference, "conversationId");
  }

  private static isDocumentVersionReference(
    reference: FileEntity.Reference,
  ): reference is FileEntity.DocumentVersionReference {
    return Object.hasOwn(reference, "collectionId");
  }
}
