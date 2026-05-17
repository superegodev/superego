import type { AppId, AppVersion, AppVersionId } from "@superego/backend";

export default interface AppVersionEntity {
  id: AppVersionId;
  previousVersionId: AppVersionId | null;
  appId: AppId;
  targetCollections: AppVersion["targetCollections"];
  entrypoint: AppVersion["entrypoint"];
  files: AppVersion["files"];
  createdAt: Date;
}
