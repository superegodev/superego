import type { App } from "@superego/backend";
import type AppEntity from "../entities/AppEntity.js";
import type AppVersionEntity from "../entities/AppVersionEntity.js";
import makeAppVersion from "./makeAppVersion.js";

export default function makeApp(
  app: AppEntity,
  latestVersion: AppVersionEntity,
): App {
  return {
    id: app.id,
    type: app.type,
    name: app.name,
    settings: app.settings,
    latestVersion: makeAppVersion(latestVersion),
    createdAt: app.createdAt,
  };
}
