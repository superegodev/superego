import type { DatabaseSync } from "node:sqlite";
import type { CollectionCategoryId } from "@superego/backend";
import type {
  CollectionCategoryEntity,
  CollectionCategoryRepository,
} from "@superego/executing-backend";
import type SqliteCollectionCategory from "../types/SqliteCollectionCategory.js";
import { toEntity } from "../types/SqliteCollectionCategory.js";

const table = "collection_categories";

export default class SqliteCollectionCategoryRepository
  implements CollectionCategoryRepository
{
  constructor(private db: DatabaseSync) {}

  async insert(collectionCategory: CollectionCategoryEntity): Promise<void> {
    this.db
      .prepare(`
        INSERT INTO "${table}"
          ("id", "name", "icon", "parent_id", "created_at")
        VALUES
          (?, ?, ?, ?, ?)
      `)
      .run(
        collectionCategory.id,
        collectionCategory.name,
        collectionCategory.icon,
        collectionCategory.parentId,
        collectionCategory.createdAt.toISOString(),
      );
  }

  async replace(collectionCategory: CollectionCategoryEntity): Promise<void> {
    this.db
      .prepare(`
        UPDATE "${table}"
        SET
          "name" = ?,
          "icon" = ?,
          "parent_id" = ?,
          "created_at" = ?
        WHERE "id" = ?
      `)
      .run(
        collectionCategory.name,
        collectionCategory.icon,
        collectionCategory.parentId,
        collectionCategory.createdAt.toISOString(),
        collectionCategory.id,
      );
  }

  async delete(id: CollectionCategoryId): Promise<CollectionCategoryId> {
    this.db.prepare(`DELETE FROM "${table}" WHERE "id" = ?`).run(id);
    return id;
  }

  async exists(id: CollectionCategoryId): Promise<boolean> {
    const result = this.db
      .prepare(`SELECT 1 FROM "${table}" WHERE "id" = ?`)
      .get(id) as 1 | undefined;
    return result !== undefined;
  }

  async existsWhereParentIdEq(
    parentId: CollectionCategoryId,
  ): Promise<boolean> {
    const result = this.db
      .prepare(`SELECT 1 FROM "${table}" WHERE "parent_id" = ?`)
      .get(parentId) as 1 | undefined;
    return result !== undefined;
  }

  async find(
    id: CollectionCategoryId,
  ): Promise<CollectionCategoryEntity | null> {
    const collectionCategory = this.db
      .prepare(`SELECT * FROM "${table}" WHERE "id" = ?`)
      .get(id) as SqliteCollectionCategory | undefined;
    return collectionCategory ? toEntity(collectionCategory) : null;
  }

  async findAll(): Promise<CollectionCategoryEntity[]> {
    const collectionCategories = this.db
      .prepare(`SELECT * FROM "${table}" ORDER BY "name" ASC`)
      .all() as SqliteCollectionCategory[];
    return collectionCategories.map(toEntity);
  }
}
