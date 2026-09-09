import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AppType, type App } from "@superego/backend";
import {
  defaultAppPermissions,
  emptyAppStateDefinition,
  makeSuccessfulResult,
} from "@superego/shared-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CliBackend } from "../common/commandUtils.js";
import { compileApp } from "../common/compile.js";
import { buildLock, readLock } from "../common/lock.js";
import { writeManifest } from "../common/manifest.js";
import { writeStateDefinitionSource } from "../common/stateDefinition.js";
import type { AppManifest } from "../common/types.js";
import updateApp from "./updateApp.js";

vi.mock("../common/compile.js", () => ({
  compileApp: vi.fn(async () => ({ source: "updated", compiled: "updated" })),
}));

describe("updateApp", () => {
  let path: string;
  let app: App;
  let manifest: AppManifest;

  beforeEach(async () => {
    vi.clearAllMocks();
    path = mkdtempSync(join(tmpdir(), "superego-update-app-"));
    app = {
      id: "App_devices",
      name: "Devices",
      type: AppType.CollectionView,
      createdAt: new Date(),
      permissions: defaultAppPermissions,
      latestVersion: {
        id: "AppVersion_original",
        createdAt: new Date(),
        targetCollections: [],
        files: { "/main.tsx": { source: "source", compiled: "compiled" } },
        stateDefinition: emptyAppStateDefinition,
      },
    };
    manifest = {
      name: app.name,
      type: app.type,
      targetCollectionIds: [],
      permissions: {
        ...defaultAppPermissions,
        http: { allowedOrigins: ["http://192.168.1.10"] },
      },
      stateDefinition: {
        schema: "state.schema.json",
        initialState: "state.initial.json",
        migration: null,
      },
    };
    writeFileSync(join(path, "main.tsx"), "source");
    await writeManifest(path, manifest);
    await writeStateDefinitionSource(path, emptyAppStateDefinition);
  });
  afterEach(() => {
    rmSync(path, { recursive: true });
  });

  it("updates permissions without compiling or publishing a version", async () => {
    // Setup mocks
    const updatePermissions = vi.fn(async () =>
      makeSuccessfulResult({ ...app, permissions: manifest.permissions }),
    );
    const createNewVersion = vi.fn();
    const backend = {
      apps: {
        list: async () => makeSuccessfulResult([app]),
        updatePermissions,
        createNewVersion,
      },
    } as unknown as CliBackend;

    // Exercise
    const result = await updateApp({
      backend,
      path,
      manifest,
      lock: buildLock(app),
    });

    // Verify
    expect(result.operations).toEqual(["updated permissions"]);
    expect(updatePermissions).toHaveBeenCalledWith(
      app.id,
      manifest.permissions,
    );
    expect(createNewVersion).not.toHaveBeenCalled();
    expect(compileApp).not.toHaveBeenCalled();
    expect(readLock(path)).toEqual(buildLock(app));
  });

  it("publishes code and updates permissions separately when both change", async () => {
    // Setup mocks
    writeFileSync(join(path, "main.tsx"), "updated");
    const version = {
      ...app,
      latestVersion: {
        ...app.latestVersion,
        id: "AppVersion_updated" as const,
      },
    };
    const createNewVersion = vi.fn(async () => makeSuccessfulResult(version));
    const updatePermissions = vi.fn(async () =>
      makeSuccessfulResult({ ...version, permissions: manifest.permissions }),
    );
    const backend = {
      apps: {
        list: async () => makeSuccessfulResult([app]),
        createNewVersion,
        updatePermissions,
      },
    } as unknown as CliBackend;

    // Exercise
    const result = await updateApp({
      backend,
      path,
      manifest,
      lock: buildLock(app),
    });

    // Verify
    expect(result.operations).toEqual([
      "created new version",
      "updated permissions",
    ]);
    expect(createNewVersion).toHaveBeenCalledWith(
      app.id,
      app.latestVersion.id,
      [],
      { "/main.tsx": { source: "updated", compiled: "updated" } },
      emptyAppStateDefinition,
    );
    expect(updatePermissions).toHaveBeenCalledWith(
      app.id,
      manifest.permissions,
    );
    expect(readLock(path)?.latestAppVersionId).toBe(version.latestVersion.id);
  });
});
