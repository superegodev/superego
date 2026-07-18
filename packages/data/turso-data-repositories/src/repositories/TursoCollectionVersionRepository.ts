import type { CollectionId, CollectionVersionId } from "@superego/backend";
import type {
  CollectionVersionEntity,
  CollectionVersionRepository,
} from "@superego/executing-backend";
import type TursoDatabase from "../TursoDatabase.js";
import type TursoCollectionVersion from "../types/TursoCollectionVersion.js";
import { toEntity } from "../types/TursoCollectionVersion.js";

const table = "collection_versions";

export default class TursoCollectionVersionRepository implements CollectionVersionRepository {
  constructor(private db: TursoDatabase) {}

  async insert(collectionVersion: CollectionVersionEntity): Promise<void> {
    await this.db
      .prepare(`
        UPDATE "${table}"
        SET "is_latest" = 0
        WHERE "collection_id" = ? AND "is_latest" = 1
      `)
      .run(collectionVersion.collectionId);
    await this.db
      .prepare(`
        INSERT INTO "${table}"
          (
            "id",
            "previous_version_id",
            "collection_id",
            "schema",
            "settings",
            "migration",
            "created_at",
            "is_latest"
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?)
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
        collectionVersion.createdAt.toISOString(),
        1,
      );
  }

  async replace(collectionVersion: CollectionVersionEntity): Promise<void> {
    await this.db
      .prepare(`
        UPDATE "${table}"
        SET
          "previous_version_id" = ?,
          "collection_id" = ?,
          "schema" = ?,
          "settings" = ?,
          "migration" = ?,
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
        collectionVersion.createdAt.toISOString(),
        collectionVersion.id,
      );
  }

  async deleteAllWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<CollectionVersionId[]> {
    const result = (await this.db
      .prepare(`SELECT "id" FROM "${table}" WHERE "collection_id" = ?`)
      .all(collectionId)) as { id: CollectionVersionId }[];
    await this.db
      .prepare(`DELETE FROM "${table}" WHERE "collection_id" = ?`)
      .run(collectionId);
    return result.map(({ id }) => id);
  }

  async find(id: CollectionVersionId): Promise<CollectionVersionEntity | null> {
    const collectionVersion = (await this.db
      .prepare(`SELECT * FROM "${table}" WHERE "id" = ?`)
      .get(id)) as TursoCollectionVersion | undefined;
    return collectionVersion ? toEntity(collectionVersion) : null;
  }

  async findLatestWhereCollectionIdEq(
    collectionId: CollectionId,
  ): Promise<CollectionVersionEntity | null> {
    const collectionVersion = (await this.db
      .prepare(
        `SELECT * FROM "${table}" WHERE "collection_id" = ? AND "is_latest" = 1`,
      )
      .get(collectionId)) as TursoCollectionVersion | undefined;
    return collectionVersion ? toEntity(collectionVersion) : null;
  }

  async findAllLatests(): Promise<CollectionVersionEntity[]> {
    const collectionVersions = (await this.db
      .prepare(`SELECT * FROM "${table}" WHERE "is_latest" = 1`)
      .all()) as TursoCollectionVersion[];
    return collectionVersions.map(toEntity);
  }
}
