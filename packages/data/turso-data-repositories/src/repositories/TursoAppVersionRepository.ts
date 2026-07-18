import { encode } from "@msgpack/msgpack";
import type { AppId, AppVersionId } from "@superego/backend";
import type {
  AppVersionEntity,
  AppVersionRepository,
} from "@superego/executing-backend";
import type TursoDatabase from "../TursoDatabase.js";
import type TursoAppVersion from "../types/TursoAppVersion.js";
import { toEntity } from "../types/TursoAppVersion.js";

const table = "app_versions";

export default class TursoAppVersionRepository implements AppVersionRepository {
  constructor(private db: TursoDatabase) {}

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
      .prepare(`SELECT "id" FROM "${table}" WHERE "app_id" = ?`)
      .all(appId)) as { id: AppVersionId }[];
    await this.db
      .prepare(`DELETE FROM "${table}" WHERE "app_id" = ?`)
      .run(appId);
    return result.map(({ id }) => id);
  }

  async findLatestWhereAppIdEq(appId: AppId): Promise<AppVersionEntity | null> {
    const appVersion = (await this.db
      .prepare(
        `SELECT * FROM "${table}" WHERE "app_id" = ? AND "is_latest" = 1`,
      )
      .get(appId)) as TursoAppVersion | undefined;
    return appVersion ? toEntity(appVersion) : null;
  }

  async findAllLatests(): Promise<AppVersionEntity[]> {
    const appVersions = (await this.db
      .prepare(`SELECT * FROM "${table}" WHERE "is_latest" = 1`)
      .all()) as TursoAppVersion[];
    return appVersions.map(toEntity);
  }
}
