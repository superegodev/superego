import type { AppPermissions } from "@superego/backend";
import type { AppVersionEntity } from "@superego/executing-backend";
import type Data from "../Data.js";

export default function migrateAppPermissions(data: Data): boolean {
  let changed = false;
  const latestVersions: Record<
    string,
    AppVersionEntity & { permissions?: AppPermissions }
  > = {};
  for (const version of Object.values(data.appVersions)) {
    const latest = latestVersions[version.appId];
    if (
      !latest ||
      version.createdAt > latest.createdAt ||
      (version.createdAt.getTime() === latest.createdAt.getTime() &&
        version.id > latest.id)
    ) {
      latestVersions[version.appId] = version;
    }
  }
  for (const app of Object.values(data.apps)) {
    if (app.permissions === undefined) {
      app.permissions = latestVersions[app.id]?.permissions ?? {
        modals: false,
        downloads: false,
        http: { allowedOrigins: [] },
      };
      changed = true;
    }
  }
  for (const version of Object.values(data.appVersions)) {
    if ("permissions" in version) {
      delete version.permissions;
      changed = true;
    }
  }
  return changed;
}
