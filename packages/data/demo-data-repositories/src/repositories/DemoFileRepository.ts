import type { CollectionId, DocumentId, FileId } from "@superego/backend";
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
    files: (FileEntity & { content: Uint8Array })[],
  ): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    files.forEach((file) => {
      this.files[file.id] = clone(file);
    });
  }

  async deleteAllWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<FileId[]> {
    this.ensureNotDisposed();
    this.onWrite();
    const deletedIds: FileId[] = [];
    Object.values(this.files).forEach((file) => {
      if (file.collectionId === collectionId) {
        delete this.files[file.id];
        deletedIds.push(file.id);
      }
    });
    return deletedIds;
  }

  async deleteAllWhereDocumentIdEq(documentId: DocumentId): Promise<FileId[]> {
    this.ensureNotDisposed();
    this.onWrite();
    const deletedIds: FileId[] = [];
    Object.values(this.files).forEach((file) => {
      if (file.documentId === documentId) {
        delete this.files[file.id];
        deletedIds.push(file.id);
      }
    });
    return deletedIds;
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

  async getContent(id: FileId): Promise<Uint8Array | null> {
    this.ensureNotDisposed();
    return clone(this.files[id]?.content ?? null);
  }
}
