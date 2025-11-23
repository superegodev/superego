import type { FileId } from "@superego/backend";
import type { FileEntity, FileRepository } from "@superego/executing-backend";
import type Data from "../Data.js";
import clone from "../utils/clone.js";
import Disposable from "../utils/Disposable.js";

export default class DemoFileRepository
  extends Disposable
  implements FileRepository
{
  constructor(
    private files: Data["files"],
    private onWrite: () => void,
  ) {
    super();
  }

  async insertAll(
    files: (FileEntity & { content: Uint8Array<ArrayBuffer> })[],
  ): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    files.forEach((file) => {
      this.files[file.id] = clone(file);
    });
  }

  async addReferenceToAll(
    ids: FileId[],
    reference: FileEntity.Reference,
  ): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    Object.values(this.files)
      .filter((file) => ids.includes(file.id))
      .forEach((file) => {
        if (
          !DemoFileRepository.referencesIncludes(file.referencedBy, reference)
        ) {
          this.files[file.id] = clone({
            ...file,
            referencedBy: [...file.referencedBy, reference],
          });
        }
      });
  }

  async deleteReferenceFromAll(
    reference:
      | Omit<FileEntity.DocumentVersionReference, "documentVersionId">
      | FileEntity.ConversationReference,
  ): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    const files = Object.values(this.files);
    for (const file of files) {
      const updatedReferences = file.referencedBy.filter(
        (ref) =>
          !DemoFileRepository.matchesReferenceForDeletion(ref, reference),
      );
      if (updatedReferences.length === 0) {
        delete this.files[file.id];
      } else if (updatedReferences.length !== file.referencedBy.length) {
        this.files[file.id] = clone({
          ...file,
          referencedBy: updatedReferences,
        });
      }
    }
  }

  async find(id: FileId): Promise<FileEntity | null> {
    this.ensureNotDisposed();
    const fileWithContent = this.files[id];
    if (!fileWithContent) {
      return null;
    }
    const { content, ...file } = fileWithContent;
    return clone(file);
  }

  async findAllWhereIdIn(ids: FileId[]): Promise<FileEntity[]> {
    this.ensureNotDisposed();
    return clone(
      Object.values(this.files)
        .filter((file) => ids.includes(file.id))
        .map(({ content, ...file }) => file),
    );
  }

  async getContent(id: FileId): Promise<Uint8Array<ArrayBuffer> | null> {
    this.ensureNotDisposed();
    return clone(this.files[id]?.content ?? null);
  }

  private static referencesIncludes(
    references: FileEntity.Reference[],
    reference: FileEntity.Reference,
  ): boolean {
    return references.some((ref) =>
      DemoFileRepository.referencesAreEqual(ref, reference),
    );
  }

  private static referencesAreEqual(
    a: FileEntity.Reference,
    b: FileEntity.Reference,
  ): boolean {
    if (
      DemoFileRepository.isConversationReference(a) &&
      DemoFileRepository.isConversationReference(b)
    ) {
      return a.conversationId === b.conversationId;
    }
    if (
      DemoFileRepository.isDocumentVersionReference(a) &&
      DemoFileRepository.isDocumentVersionReference(b)
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
    if (DemoFileRepository.isConversationReference(target)) {
      return (
        DemoFileRepository.isConversationReference(reference) &&
        reference.conversationId === target.conversationId
      );
    }
    return (
      DemoFileRepository.isDocumentVersionReference(reference) &&
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
    return "conversationId" in reference;
  }

  private static isDocumentVersionReference(
    reference: FileEntity.Reference,
  ): reference is FileEntity.DocumentVersionReference {
    return "collectionId" in reference;
  }
}
