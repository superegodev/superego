import type { DatabaseSync } from "node:sqlite";
import { encode } from "@msgpack/msgpack";
import type { CollectionId, CollectionVersionId } from "@superego/backend";
import type {
  CollectionVersionEntity,
  CollectionVersionRepository,
} from "@superego/executing-backend";
import type SqliteCollectionVersion from "../types/SqliteCollectionVersion.js";
import { toEntity } from "../types/SqliteCollectionVersion.js";

const table = "collection_versions";

export default class SqliteCollectionVersionRepository
  implements CollectionVersionRepository
{
  constructor(private db: DatabaseSync) {}

  async insert(collectionVersion: CollectionVersionEntity): Promise<void> {
    this.db
      .prepare(`
        UPDATE "${table}"
        SET "is_latest" = 0
        WHERE "collection_id" = ? AND "is_latest" = 1
      `)
      .run(collectionVersion.collectionId);
    this.db
      .prepare(`
        INSERT INTO "${table}"
          (
            "id",
            "previous_version_id",
            "collection_id",
            "schema",
            "settings",
            "migration",
            "remote_converters",
            "created_at",
            "is_latest"
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        collectionVersion.id,
        collectionVersion.previousVersionId,
        collectionVersion.collectionId,
        JSON.stringify(collectionVersion.schema),
        JSON.stringify(collectionVersion.settings),
        collectionVersion.migration
          ? JSON.stringify(collectionVersion.migration)
          : null,
        collectionVersion.remoteConverters
          ? encode(collectionVersion.remoteConverters)
          : null,
        collectionVersion.createdAt.toISOString(),
        1,
      );
  }

  async replace(collectionVersion: CollectionVersionEntity): Promise<void> {
    this.db
      .prepare(`
        UPDATE "${table}"
        SET
          "previous_version_id" = ?,
          "collection_id" = ?,
          "schema" = ?,
          "settings" = ?,
          "migration" = ?,
          "remote_converters" = ?,
          "created_at" = ?
        WHERE "id" = ?
      `)
      .run(
        collectionVersion.previousVersionId,
        collectionVersion.collectionId,
        JSON.stringify(collectionVersion.schema),
        JSON.stringify(collectionVersion.settings),
        collectionVersion.migration
          ? JSON.stringify(collectionVersion.migration)
          : null,
        collectionVersion.remoteConverters
          ? encode(collectionVersion.remoteConverters)
          : null,
        collectionVersion.createdAt.toISOString(),
        collectionVersion.id,
      );
  }

  async deleteAllWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<CollectionVersionId[]> {
    const result = this.db
      .prepare(
        `DELETE FROM "${table}" WHERE "collection_id" = ? RETURNING "id"`,
      )
      .all(collectionId) as { id: CollectionVersionId }[];
    return result.map(({ id }) => id);
  }

  async find(id: CollectionVersionId): Promise<CollectionVersionEntity | null> {
    const collectionVersion = this.db
      .prepare(`SELECT * FROM "${table}" WHERE "id" = ?`)
      .get(id) as SqliteCollectionVersion | undefined;
    return collectionVersion ? toEntity(collectionVersion) : null;
  }

  async findLatestWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<CollectionVersionEntity | null> {
    const collectionVersion = this.db
      .prepare(
        `SELECT * FROM "${table}" WHERE "collection_id" = ? AND "is_latest" = 1`,
      )
      .get(collectionId) as SqliteCollectionVersion | undefined;
    return collectionVersion ? toEntity(collectionVersion) : null;
  }

  async findAllLatests(): Promise<CollectionVersionEntity[]> {
    const collectionVersions = this.db
      .prepare(`SELECT * FROM "${table}" WHERE "is_latest" = 1`)
      .all() as any as SqliteCollectionVersion[];
    return collectionVersions.map(toEntity);
  }
}
