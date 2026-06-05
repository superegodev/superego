import { encode } from "@msgpack/msgpack";
import type { AppId, AppVersionId } from "@superego/backend";
import type {
  AppVersionEntity,
  AppVersionRepository,
} from "@superego/executing-backend";
import type AsyncSqliteDatabase from "../AsyncSqliteDatabase.js";
import type SqliteAppVersion from "../types/SqliteAppVersion.js";
import { toEntity } from "../types/SqliteAppVersion.js";

const table = "app_versions";

export default class SqliteAppVersionRepository implements AppVersionRepository {
  constructor(private db: AsyncSqliteDatabase) {}

  async insert(appVersion: AppVersionEntity): Promise<void> {
    await this.db
      .prepare(`
        UPDATE "${table}"
        SET "is_latest" = 0
        WHERE "app_id" = ? AND "is_latest" = 1
      `)
      .run(appVersion.appId);
    await this.db
      .prepare(`
        INSERT INTO "${table}"
          (
            "id",
            "previous_version_id",
            "app_id",
            "target_collections",
            "files",
            "created_at",
            "is_latest"
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        appVersion.id,
        appVersion.previousVersionId,
        appVersion.appId,
        encode(appVersion.targetCollections),
        encode(appVersion.files),
        appVersion.createdAt.toISOString(),
        1,
      );
  }

  async deleteAllWhereAppIdEq(appId: AppId): Promise<AppVersionId[]> {
    const result = (await this.db
      .prepare(`DELETE FROM "${table}" WHERE "app_id" = ? RETURNING "id" AS id`)
      .all(appId)) as { id: AppVersionId }[];
    return result.map(({ id }) => id);
  }

  async findLatestWhereAppIdEq(appId: AppId): Promise<AppVersionEntity | null> {
    const appVersion = (await this.db
      .prepare(
        `SELECT * FROM "${table}" WHERE "app_id" = ? AND "is_latest" = 1`,
      )
      .get(appId)) as SqliteAppVersion | undefined;
    return appVersion ? toEntity(appVersion) : null;
  }

  async findAllLatests(): Promise<AppVersionEntity[]> {
    const appVersions = (await this.db
      .prepare(`SELECT * FROM "${table}" WHERE "is_latest" = 1`)
      .all()) as SqliteAppVersion[];
    return appVersions.map(toEntity);
  }
}
