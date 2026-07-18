import type { CollectionCategoryId } from "@superego/backend";
import type {
  CollectionCategoryEntity,
  CollectionCategoryRepository,
} from "@superego/executing-backend";
import type TursoDatabase from "../TursoDatabase.js";
import type TursoCollectionCategory from "../types/TursoCollectionCategory.js";
import { toEntity } from "../types/TursoCollectionCategory.js";

const table = "collection_categories";

export default class TursoCollectionCategoryRepository implements CollectionCategoryRepository {
  constructor(private db: TursoDatabase) {}

  async insert(collectionCategory: CollectionCategoryEntity): Promise<void> {
    await this.db
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
    await this.db
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
    await this.db.prepare(`DELETE FROM "${table}" WHERE "id" = ?`).run(id);
    return id;
  }

  async exists(id: CollectionCategoryId): Promise<boolean> {
    const result = (await this.db
      .prepare(`SELECT 1 FROM "${table}" WHERE "id" = ?`)
      .get(id)) as 1 | undefined;
    return result !== undefined;
  }

  async existsWhereParentIdEq(
    parentId: CollectionCategoryId,
  ): Promise<boolean> {
    const result = (await this.db
      .prepare(`SELECT 1 FROM "${table}" WHERE "parent_id" = ?`)
      .get(parentId)) as 1 | undefined;
    return result !== undefined;
  }

  async find(
    id: CollectionCategoryId,
  ): Promise<CollectionCategoryEntity | null> {
    const collectionCategory = (await this.db
      .prepare(`SELECT * FROM "${table}" WHERE "id" = ?`)
      .get(id)) as TursoCollectionCategory | undefined;
    return collectionCategory ? toEntity(collectionCategory) : null;
  }

  async findAll(): Promise<CollectionCategoryEntity[]> {
    const collectionCategories = (await this.db
      .prepare(`SELECT * FROM "${table}" ORDER BY "name" ASC`)
      .all()) as TursoCollectionCategory[];
    return collectionCategories.map(toEntity);
  }
}
