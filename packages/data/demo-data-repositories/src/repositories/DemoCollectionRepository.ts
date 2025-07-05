import type { CollectionCategoryId, CollectionId } from "@superego/backend";
import type {
  CollectionEntity,
  CollectionRepository,
} from "@superego/executing-backend";
import type Data from "../Data.js";
import clone from "../utils/clone.js";
import Disposable from "../utils/Disposable.js";

export default class DemoCollectionRepository
  extends Disposable
  implements CollectionRepository
{
  constructor(
    private collections: Data["collections"],
    private onWrite: () => void,
  ) {
    super();
  }

  async insert(collection: CollectionEntity): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    this.collections[collection.id] = clone(collection);
  }

  async replace(collection: CollectionEntity): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    this.collections[collection.id] = clone(collection);
  }

  async delete(id: CollectionId): Promise<CollectionId> {
    this.ensureNotDisposed();
    this.onWrite();
    delete this.collections[id];
    return id;
  }

  async exists(id: CollectionId): Promise<boolean> {
    this.ensureNotDisposed();
    return this.collections[id] !== undefined;
  }

  async existsWhereSettingsCollectionCategoryIdEq(
    settingsCollectionCategoryId: CollectionCategoryId,
  ): Promise<boolean> {
    this.ensureNotDisposed();
    return Object.values(this.collections).some(
      (collection) =>
        collection.settings.collectionCategoryId ===
        settingsCollectionCategoryId,
    );
  }

  async find(id: CollectionId): Promise<CollectionEntity | null> {
    this.ensureNotDisposed();
    return clone(this.collections[id] ?? null);
  }

  async findAll(): Promise<CollectionEntity[]> {
    this.ensureNotDisposed();
    return clone(Object.values(this.collections));
  }
}
