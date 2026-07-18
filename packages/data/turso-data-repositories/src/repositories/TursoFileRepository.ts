import type { FileId } from "@superego/backend";
import type { FileEntity, FileRepository } from "@superego/executing-backend";
import type TursoDatabase from "../TursoDatabase.js";
import type TursoFile from "../types/TursoFile.js";
import { toEntity } from "../types/TursoFile.js";

const table = "files";

export default class TursoFileRepository implements FileRepository {
  constructor(private db: TursoDatabase) {}

  async insertAll(
    filesWithContent: (FileEntity & { content: Uint8Array<ArrayBuffer> })[],
  ): Promise<void> {
    const insert = await this.db.prepare(`
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
      await insert.run(
        file.id,
        JSON.stringify(file.referencedBy),
        file.createdAt.toISOString(),
        file.content,
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
    const files = (await this.db
      .prepare(
        `SELECT "id", "referenced_by" FROM "${table}" WHERE "id" IN (${placeholders})`,
      )
      .all(...ids)) as Pick<TursoFile, "id" | "referenced_by">[];
    const update = await this.db.prepare(
      `UPDATE "${table}" SET "referenced_by" = ? WHERE "id" = ?`,
    );
    for (const file of files) {
      const references = TursoFileRepository.parseReferences(
        file.referenced_by,
      );
      if (!TursoFileRepository.referencesIncludes(references, reference)) {
        references.push(reference);
        await update.run(JSON.stringify(references), file.id);
      }
    }
  }

  async deleteReferenceFromAll(
    reference:
      | Omit<FileEntity.DocumentVersionReference, "documentVersionId">
      | FileEntity.ConversationReference,
  ): Promise<void> {
    const files = (await this.db
      .prepare(`SELECT "id", "referenced_by" FROM "${table}"`)
      .all()) as Pick<TursoFile, "id" | "referenced_by">[];
    const update = await this.db.prepare(
      `UPDATE "${table}" SET "referenced_by" = ? WHERE "id" = ?`,
    );
    const del = await this.db.prepare(`DELETE FROM "${table}" WHERE "id" = ?`);
    for (const file of files) {
      const references = TursoFileRepository.parseReferences(
        file.referenced_by,
      );
      const updatedReferences = references.filter(
        (ref) =>
          !TursoFileRepository.matchesReferenceForDeletion(ref, reference),
      );
      if (updatedReferences.length === 0) {
        await del.run(file.id);
      } else if (updatedReferences.length !== references.length) {
        await update.run(JSON.stringify(updatedReferences), file.id);
      }
    }
  }

  async find(id: FileId): Promise<FileEntity | null> {
    const file = (await this.db
      .prepare(`
        SELECT
          "id",
          "referenced_by",
          "created_at"
        FROM "${table}"
        WHERE "id" = ?;
      `)
      .get(id)) as Omit<TursoFile, "content"> | undefined;
    return file ? toEntity(file) : null;
  }

  async findAllWhereIdIn(ids: FileId[]): Promise<FileEntity[]> {
    if (ids.length === 0) {
      return [];
    }
    const placeholders = ids.map(() => "?").join(", ");
    const files = (await this.db
      .prepare(`
        SELECT
          "id",
          "referenced_by",
          "created_at"
        FROM "${table}"
        WHERE "id" IN (${placeholders})
      `)
      .all(...ids)) as Omit<TursoFile, "content">[];
    return files.map(toEntity);
  }

  async getContent(id: FileId): Promise<Uint8Array<ArrayBuffer> | null> {
    const result = (await this.db
      .prepare(`SELECT "content" FROM "${table}" WHERE "id" = ?`)
      .get(id)) as { content: Uint8Array<ArrayBuffer> } | undefined;
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
      TursoFileRepository.referencesAreEqual(ref, reference),
    );
  }

  private static referencesAreEqual(
    a: FileEntity.Reference,
    b: FileEntity.Reference,
  ): boolean {
    if (
      TursoFileRepository.isConversationReference(a) &&
      TursoFileRepository.isConversationReference(b)
    ) {
      return a.conversationId === b.conversationId;
    }
    if (
      TursoFileRepository.isDocumentVersionReference(a) &&
      TursoFileRepository.isDocumentVersionReference(b)
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
    if (TursoFileRepository.isConversationReference(target)) {
      return (
        TursoFileRepository.isConversationReference(reference) &&
        reference.conversationId === target.conversationId
      );
    }
    return (
      TursoFileRepository.isDocumentVersionReference(reference) &&
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
