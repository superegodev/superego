import type AppType from "../enums/AppType.js";
import type AppId from "../ids/AppId.js";
import type AppSettings from "./AppSettings.js";
import type AppVersion from "./AppVersion.js";

export default interface App {
  id: AppId;
  type: AppType;
  name: string;
  settings: AppSettings;
  latestVersion: AppVersion;
  createdAt: Date;
}
