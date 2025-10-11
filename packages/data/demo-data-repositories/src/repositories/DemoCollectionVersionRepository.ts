import type { CollectionId, CollectionVersionId } from "@superego/backend";
import type {
  CollectionVersionEntity,
  CollectionVersionRepository,
} from "@superego/executing-backend";
import type Data from "../Data.js";
import clone from "../utils/clone.js";
import Disposable from "../utils/Disposable.js";

export default class DemoCollectionVersionRepository
  extends Disposable
  implements CollectionVersionRepository
{
  constructor(
    private collectionVersions: Data["collectionVersions"],
    private onWrite: () => void,
  ) {
    super();
  }

  async insert(collectionVersion: CollectionVersionEntity): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    this.collectionVersions[collectionVersion.id] = clone(collectionVersion);
  }

  async replace(collectionVersion: CollectionVersionEntity): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    this.collectionVersions[collectionVersion.id] = clone(collectionVersion);
  }

  async deleteAllWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<CollectionVersionId[]> {
    this.ensureNotDisposed();
    this.onWrite();
    const deletedIds: CollectionVersionId[] = [];
    Object.values(this.collectionVersions).forEach((collectionVersion) => {
      if (collectionVersion.collectionId === collectionId) {
        delete this.collectionVersions[collectionVersion.id];
        deletedIds.push(collectionVersion.id);
      }
    });
    return deletedIds;
  }

  async find(id: CollectionVersionId): Promise<CollectionVersionEntity | null> {
    this.ensureNotDisposed();
    return clone(this.collectionVersions[id] ?? null);
  }

  async findLatestWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<CollectionVersionEntity | null> {
    this.ensureNotDisposed();
    const [latestCollectionVersion] = Object.values(this.collectionVersions)
      .filter(
        (collectionVersion) => collectionVersion.collectionId === collectionId,
      )
      .sort((a, b) => (a.id <= b.id ? 1 : -1));
    return clone(latestCollectionVersion ?? null);
  }

  async findAllLatests(): Promise<CollectionVersionEntity[]> {
    this.ensureNotDisposed();
    const latestCollectionVersions: Record<
      CollectionId,
      CollectionVersionEntity
    > = {};
    Object.values(this.collectionVersions).forEach((collectionVersion) => {
      const currentLatest =
        latestCollectionVersions[collectionVersion.collectionId];
      if (!currentLatest || collectionVersion.id > currentLatest.id) {
        latestCollectionVersions[collectionVersion.collectionId] =
          collectionVersion;
      }
    });
    return clone(Object.values(latestCollectionVersions));
  }
}
