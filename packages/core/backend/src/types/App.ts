import type AppType from "../enums/AppType.js";
import type AppId from "../ids/AppId.js";
import type AppPermissions from "./AppPermissions.js";
import type AppVersion from "./AppVersion.js";

export default interface App {
  id: AppId;
  type: AppType;
  name: string;
  permissions: AppPermissions;
  latestVersion: AppVersion;
  createdAt: Date;
}
