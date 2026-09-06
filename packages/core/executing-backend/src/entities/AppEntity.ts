import type { AppId, AppType, AppState } from "@superego/backend";

export default interface AppEntity {
  id: AppId;
  type: AppType;
  name: string;
  createdAt: Date;
  state: AppState;
}
