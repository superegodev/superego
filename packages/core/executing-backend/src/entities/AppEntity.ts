import type { AppId, AppType } from "@superego/backend";

export default interface AppEntity {
  id: AppId;
  type: AppType;
  name: string;
  createdAt: Date;
}
