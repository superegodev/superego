import type { AppId, AppSettings, AppType } from "@superego/backend";

export default interface AppEntity {
  id: AppId;
  type: AppType;
  name: string;
  settings: AppSettings;
  createdAt: Date;
}
