import type { AppId, AppVersionId } from "@superego/backend";
import type AppVersionEntity from "../entities/AppVersionEntity.js";

export default interface AppVersionRepository {
  insert(appVersion: AppVersionEntity): Promise<void>;
  deleteAllWhereAppIdEq(appId: AppId): Promise<AppVersionId[]>;
  findLatestWhereAppIdEq(appId: AppId): Promise<AppVersionEntity | null>;
  findAllLatests(): Promise<AppVersionEntity[]>;
}
