import type {
  CollectionId,
  DocumentId,
  DocumentVersionId,
} from "@superego/backend";
import type {
  DocumentVersionEntity,
  DocumentVersionRepository,
} from "@superego/executing-backend";
import type Data from "../Data.js";
import clone from "../utils/clone.js";
import Disposable from "../utils/Disposable.js";

export default class DemoDocumentVersionRepository
  extends Disposable
  implements DocumentVersionRepository
{
  constructor(
    private documentVersions: Data["documentVersions"],
    private onWrite: () => void,
  ) {
    super();
  }

  async insert(documentVersion: DocumentVersionEntity): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    this.documentVersions[documentVersion.id] = clone(documentVersion);
  }

  async deleteAllWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<DocumentVersionId[]> {
    this.ensureNotDisposed();
    this.onWrite();
    const deletedIds: DocumentVersionId[] = [];
    Object.values(this.documentVersions).forEach((documentVersion) => {
      if (documentVersion.collectionId === collectionId) {
        delete this.documentVersions[documentVersion.id];
        deletedIds.push(documentVersion.id);
      }
    });
    return deletedIds;
  }

  async deleteAllWhereDocumentIdEq(
    documentId: DocumentId,
  ): Promise<DocumentVersionId[]> {
    this.ensureNotDisposed();
    this.onWrite();
    const deletedIds: DocumentVersionId[] = [];
    Object.values(this.documentVersions).forEach((documentVersion) => {
      if (documentVersion.documentId === documentId) {
        delete this.documentVersions[documentVersion.id];
        deletedIds.push(documentVersion.id);
      }
    });
    return deletedIds;
  }

  async find(id: DocumentVersionId): Promise<DocumentVersionEntity | null> {
    this.ensureNotDisposed();
    return clone(this.documentVersions[id] ?? null);
  }

  async findLatestWhereDocumentIdEq(
    documentId: DocumentId,
  ): Promise<DocumentVersionEntity | null> {
    this.ensureNotDisposed();
    const [latestDocumentVersion] = Object.values(this.documentVersions)
      .filter((documentVersion) => documentVersion.documentId === documentId)
      .sort((a, b) => (a.id <= b.id ? 1 : -1));
    return clone(latestDocumentVersion ?? null);
  }

  async findAllLatestsWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<DocumentVersionEntity[]> {
    this.ensureNotDisposed();
    const latestDocumentVersions: Record<DocumentId, DocumentVersionEntity> =
      {};
    Object.values(this.documentVersions)
      .filter(
        (documentVersion) => documentVersion.collectionId === collectionId,
      )
      .forEach((documentVersion) => {
        const currentLatest =
          latestDocumentVersions[documentVersion.documentId];
        if (!currentLatest || documentVersion.id > currentLatest.id) {
          latestDocumentVersions[documentVersion.documentId] = documentVersion;
        }
      });
    return clone(Object.values(latestDocumentVersions));
  }
}
