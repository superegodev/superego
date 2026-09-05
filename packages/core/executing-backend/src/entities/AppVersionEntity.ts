import type { AppId, AppVersion, AppVersionId } from "@superego/backend";

export default interface AppVersionEntity {
  id: AppVersionId;
  previousVersionId: AppVersionId | null;
  appId: AppId;
  targetCollections: AppVersion["targetCollections"];
  /** Current Markdown specification, versioned with the implementation. */
  spec: string;
  files: AppVersion["files"];
  createdAt: Date;
}
