import { AppType } from "@superego/backend";
import type { AppEntity, AppVersionEntity } from "@superego/executing-backend";
import { expect, it } from "vitest";
import type Data from "../Data.js";
import migrateAppPermissions from "./migrateAppPermissions.js";

it("moves the latest version permissions and leaves existing app configuration intact", () => {
  // Setup SUT
  const restrictive = {
    modals: false,
    downloads: false,
    http: { allowedOrigins: [] },
  };
  const permissions = {
    ...restrictive,
    http: { allowedOrigins: ["http://192.168.1.10"] },
  };
  const version = {
    id: "AppVersion_old",
    appId: "App_devices",
    previousVersionId: null,
    targetCollections: [],
    files: { "/main.tsx": { source: "", compiled: "" } },
    createdAt: new Date(0),
    permissions: restrictive,
  } as unknown as AppVersionEntity & { permissions: typeof permissions };
  const app = {
    id: "App_devices",
    name: "Devices",
    type: AppType.CollectionView,
    createdAt: new Date(0),
    state: { content: { device: "selected" }, revision: 3 },
  } as unknown as AppEntity;
  const data = {
    apps: { [app.id]: app },
    appVersions: {
      [version.id]: version,
      AppVersion_latest: {
        ...version,
        id: "AppVersion_latest",
        previousVersionId: version.id,
        createdAt: new Date(1),
        permissions,
      },
    },
  } as unknown as Data;

  // Exercise
  const changed = migrateAppPermissions(data);

  // Verify
  expect(changed).toBe(true);
  expect(app.permissions).toEqual(permissions);
  expect(app.state).toEqual({ content: { device: "selected" }, revision: 3 });
  expect(
    Object.values(data.appVersions).every((entry) => !("permissions" in entry)),
  ).toBe(true);
  expect(migrateAppPermissions(data)).toBe(false);
  app.permissions = restrictive;
  expect(migrateAppPermissions(data)).toBe(false);
  expect(app.permissions).toEqual(restrictive);
});
