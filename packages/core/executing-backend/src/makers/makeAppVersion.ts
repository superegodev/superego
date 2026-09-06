import type { AppVersion } from "@superego/backend";
import type AppVersionEntity from "../entities/AppVersionEntity.js";

export default function makeAppVersion(
  appVersion: AppVersionEntity,
): AppVersion {
  return {
    id: appVersion.id,
    targetCollections: appVersion.targetCollections,
    files: appVersion.files,
    ...(appVersion.permissions && { permissions: appVersion.permissions }),
    state: appVersion.state,
    createdAt: appVersion.createdAt,
  };
}
