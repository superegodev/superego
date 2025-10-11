import type { DatabaseSync } from "node:sqlite";
import { encode } from "@msgpack/msgpack";
import type { CollectionCategoryId, CollectionId } from "@superego/backend";
import type {
  CollectionEntity,
  CollectionRepository,
} from "@superego/executing-backend";
import type SqliteCollection from "../types/SqliteCollection.js";
import { toEntity } from "../types/SqliteCollection.js";

const table = "collections";

export default class SqliteCollectionRepository
  implements CollectionRepository
{
  constructor(private db: DatabaseSync) {}

  async insert(collection: CollectionEntity): Promise<void> {
    this.db
      .prepare(`
        INSERT INTO "${table}"
          ("id", "settings", "remote", "created_at")
        VALUES
          (?, ?, ?, ?)
      `)
      .run(
        collection.id,
        JSON.stringify(collection.settings),
        collection.remote ? encode(collection.remote) : null,
        collection.createdAt.toISOString(),
      );
  }

  async replace(collection: CollectionEntity): Promise<void> {
    this.db
      .prepare(`
        UPDATE "${table}"
        SET
          "settings" = ?,
          "remote" = ?,
          "created_at" = ?
        WHERE "id" = ?
      `)
      .run(
        JSON.stringify(collection.settings),
        collection.remote ? encode(collection.remote) : null,
        collection.createdAt.toISOString(),
        collection.id,
      );
  }

  async delete(id: CollectionId): Promise<CollectionId> {
    this.db.prepare(`DELETE FROM "${table}" WHERE "id" = ?`).run(id);
    return id;
  }

  async exists(id: CollectionId): Promise<boolean> {
    const result = this.db
      .prepare(`SELECT 1 FROM "${table}" WHERE "id" = ?`)
      .get(id) as 1 | undefined;
    return result !== undefined;
  }

  async existsWhereSettingsCollectionCategoryIdEq(
    settingsCollectionCategoryId: CollectionCategoryId,
  ): Promise<boolean> {
    const result = this.db
      .prepare(
        `SELECT 1 FROM "${table}" WHERE "settings" ->> '$.collectionCategoryId' = ?`,
      )
      .get(settingsCollectionCategoryId) as 1 | undefined;
    return result !== undefined;
  }

  async find(id: CollectionId): Promise<CollectionEntity | null> {
    const collection = this.db
      .prepare(`SELECT * FROM "${table}" WHERE "id" = ?`)
      .get(id) as SqliteCollection | undefined;
    return collection ? toEntity(collection) : null;
  }

  async findAll(): Promise<CollectionEntity[]> {
    const collections = this.db
      .prepare(`SELECT * FROM "${table}" ORDER BY "settings" ->> '$.name' ASC`)
      .all() as any as SqliteCollection[];
    return collections.map(toEntity);
  }
}
