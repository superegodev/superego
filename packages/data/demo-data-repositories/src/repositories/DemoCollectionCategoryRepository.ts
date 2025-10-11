import type { CollectionCategoryId } from "@superego/backend";
import type {
  CollectionCategoryEntity,
  CollectionCategoryRepository,
} from "@superego/executing-backend";
import type Data from "../Data.js";
import clone from "../utils/clone.js";
import Disposable from "../utils/Disposable.js";

export default class DemoCollectionCategoryRepository
  extends Disposable
  implements CollectionCategoryRepository
{
  constructor(
    private collectionCategories: Data["collectionCategories"],
    private onWrite: () => void,
  ) {
    super();
  }

  async insert(collectionCategory: CollectionCategoryEntity): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    this.collectionCategories[collectionCategory.id] =
      clone(collectionCategory);
  }

  async replace(collectionCategory: CollectionCategoryEntity): Promise<void> {
    this.ensureNotDisposed();
    this.onWrite();
    this.collectionCategories[collectionCategory.id] =
      clone(collectionCategory);
  }

  async delete(id: CollectionCategoryId): Promise<CollectionCategoryId> {
    this.ensureNotDisposed();
    this.onWrite();
    delete this.collectionCategories[id];
    return id;
  }

  async exists(id: CollectionCategoryId): Promise<boolean> {
    this.ensureNotDisposed();
    return this.collectionCategories[id] !== undefined;
  }

  async existsWhereParentIdEq(
    parentId: CollectionCategoryId,
  ): Promise<boolean> {
    this.ensureNotDisposed();
    return Object.values(this.collectionCategories).some(
      (collectionCategory) => collectionCategory.parentId === parentId,
    );
  }

  async find(
    id: CollectionCategoryId,
  ): Promise<CollectionCategoryEntity | null> {
    this.ensureNotDisposed();
    return clone(this.collectionCategories[id] ?? null);
  }

  async findAll(): Promise<CollectionCategoryEntity[]> {
    this.ensureNotDisposed();
    return clone(
      Object.values(this.collectionCategories).sort((a, b) =>
        a.name >= b.name ? 1 : -1,
      ),
    );
  }
}
