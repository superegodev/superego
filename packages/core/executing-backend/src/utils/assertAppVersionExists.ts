import type { AppId } from "@superego/backend";
import type AppVersionEntity from "../entities/AppVersionEntity.js";
import AppHasNoVersions from "../errors/AppHasNoVersions.js";

export default function assertAppVersionExists(
  appId: AppId,
  appVersion: AppVersionEntity | null | undefined,
): asserts appVersion is AppVersionEntity {
  if (appVersion === null || appVersion === undefined) {
    throw new AppHasNoVersions(appId);
  }
}
