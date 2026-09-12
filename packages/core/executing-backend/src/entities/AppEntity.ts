import type {
  AppId,
  AppType,
  AppState,
  AppPermissions,
} from "@superego/backend";

export default interface AppEntity {
  id: AppId;
  type: AppType;
  name: string;
  createdAt: Date;
  state: AppState;
  permissions: AppPermissions;
}
