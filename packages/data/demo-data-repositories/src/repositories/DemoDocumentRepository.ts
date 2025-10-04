import type { CollectionId, DocumentId } from "@superego/backend";
import type {
  DocumentEntity,
  DocumentRepository,
} from "@superego/executing-backend";
import type Data from "../Data.js";
import clone from "../utils/clone.js";
import Disposable from "../utils/Disposable.js";

export default class DemoDocumentRepository
  extends Disposable
  implements DocumentRepository
{
  constructor(
    private documents: Data["documents"],
    private onWrite: () => void,
  ) {
    super();
  }

  async insert(document: DocumentEntity): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    this.documents[document.id] = clone(document);
  }

  async delete(id: DocumentId): Promise<DocumentId> {
    this.ensureNotDisposed();
    this.onWrite();
    delete this.documents[id];
    return id;
  }

  async deleteAllWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<DocumentId[]> {
    this.ensureNotDisposed();
    this.onWrite();
    const deletedIds: DocumentId[] = [];
    Object.values(this.documents).forEach((document) => {
      if (document.collectionId === collectionId) {
        delete this.documents[document.id];
        deletedIds.push(document.id);
      }
    });
    return deletedIds;
  }

  async exists(id: DocumentId): Promise<boolean> {
    this.ensureNotDisposed();
    return this.documents[id] !== undefined;
  }

  async find(id: DocumentId): Promise<DocumentEntity | null> {
    this.ensureNotDisposed();
    return clone(this.documents[id] ?? null);
  }

  async findWhereCollectionIdAndRemoteIdEq(
    collectionId: CollectionId,
    remoteId: string,
  ): Promise<DocumentEntity | null> {
    this.ensureNotDisposed();
    const document = Object.values(this.documents).find(
      (document) =>
        document.collectionId === collectionId &&
        document.remoteId === remoteId,
    );
    return clone(document ?? null);
  }

  async findAllWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<DocumentEntity[]> {
    this.ensureNotDisposed();
    return clone(
      Object.values(this.documents).filter(
        (document) => document.collectionId === collectionId,
      ),
    );
  }
}
