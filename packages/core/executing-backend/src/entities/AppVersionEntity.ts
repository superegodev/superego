import type { AppPermissions, AppStateDefinition } from "@superego/backend";
import type { AppId, AppVersion, AppVersionId } from "@superego/backend";

export default interface AppVersionEntity {
  id: AppVersionId;
  previousVersionId: AppVersionId | null;
  appId: AppId;
  targetCollections: AppVersion["targetCollections"];
  files: AppVersion["files"];
  createdAt: Date;
  permissions?: AppPermissions | undefined;
  state: AppStateDefinition;
}
