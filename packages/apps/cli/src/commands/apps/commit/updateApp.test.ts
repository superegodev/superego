import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  AppType,
  type App,
  type AppStateMigrationRequired,
} from "@superego/backend";
import { DataType } from "@superego/schema";
import {
  defaultAppPermissions,
  emptyAppStateDefinition,
  makeSuccessfulResult,
  makeUnsuccessfulResult,
} from "@superego/shared-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CliBackend } from "../common/commandUtils.js";
import { compileApp } from "../common/compile.js";
import { buildLock, readLock, writeLock } from "../common/lock.js";
import { readManifest, writeManifest } from "../common/manifest.js";
import { writeStateDefinitionSource } from "../common/stateDefinition.js";
import type { AppManifest } from "../common/types.js";
import createApp from "./createApp.js";
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

  describe("pending migrations", () => {
    let backend: CliBackend;
    let createNewVersion: ReturnType<
      typeof vi.fn<CliBackend["apps"]["createNewVersion"]>
    >;

    beforeEach(async () => {
      app.permissions = manifest.permissions;
      app.latestVersion.stateDefinition = {
        schema: {
          types: {
            State: {
              dataType: DataType.Struct,
              properties: { count: { dataType: DataType.Number } },
            },
          },
          rootType: "State",
        },
        initialState: { count: 0 },
        migration: {
          source: `import type { State } from "./app-state.js";
export default (previous: State): State => ({ count: previous.count + 1 });`,
          compiled: "previous migration",
        },
      };
      await writeStateDefinitionSource(path, app.latestVersion.stateDefinition);
      await writeLock(path, buildLock(app));
      vi.mocked(compileApp).mockImplementation(async (projectPath) => ({
        source: readFileSync(join(projectPath, "main.tsx"), "utf8"),
        compiled: "compiled",
      }));
      createNewVersion = vi.fn(async (...parameters) => {
        app = {
          ...app,
          latestVersion: {
            ...app.latestVersion,
            id: `${app.latestVersion.id}_next`,
            files: parameters[3],
            stateDefinition: parameters[4],
          },
        };
        return makeSuccessfulResult(app);
      });
      backend = {
        apps: {
          list: async () => makeSuccessfulResult([app]),
          createNewVersion,
        },
      } as unknown as CliBackend;
    });

    it("omits the historical migration from a code-only commit", async () => {
      // Setup SUT
      writeFileSync(join(path, "main.tsx"), "updated");

      // Exercise
      await updateApp({ backend, path, manifest, lock: readLock(path)! });

      // Verify
      expect(createNewVersion).toHaveBeenCalledOnce();
      expect(createNewVersion.mock.calls[0]![4].migration).toBeNull();
      expect(readManifest(path).stateDefinition.migration).toBeNull();
    });

    it("commits an explicitly pending migration once and leaves subsequent commits clean", async () => {
      // Setup SUT
      manifest.stateDefinition.migration = "state.migration.ts";
      await writeManifest(path, manifest);

      // Exercise
      await updateApp({ backend, path, manifest, lock: readLock(path)! });
      const unchangedCommit = await updateApp({
        backend,
        path,
        manifest: readManifest(path),
        lock: readLock(path)!,
      });
      writeFileSync(join(path, "main.tsx"), "updated");
      await updateApp({
        backend,
        path,
        manifest: readManifest(path),
        lock: readLock(path)!,
      });

      // Verify
      expect(unchangedCommit.operations).toEqual(["nothing to commit"]);
      expect(createNewVersion).toHaveBeenCalledTimes(2);
      expect(createNewVersion.mock.calls[0]![4].migration?.compiled).toContain(
        "previous.count + 1",
      );
      expect(createNewVersion.mock.calls[1]![4].migration).toBeNull();
      expect(readManifest(path).stateDefinition.migration).toBeNull();
      expect(readFileSync(join(path, "state.migration.ts"), "utf8")).toContain(
        "previous.count + 1",
      );
    });

    it("preserves the pending migration and lock when version creation fails", async () => {
      // Setup mocks
      createNewVersion.mockResolvedValueOnce(
        makeUnsuccessfulResult<AppStateMigrationRequired>({
          name: "AppStateMigrationRequired",
          details: { appId: app.id, issues: [] },
        }),
      );
      // Setup SUT
      manifest.stateDefinition.migration = "state.migration.ts";
      await writeManifest(path, manifest);
      const lock = readLock(path)!;

      // Exercise
      const commit = updateApp({ backend, path, manifest, lock });

      // Verify
      await expect(commit).rejects.toThrow("AppStateMigrationRequired");
      expect(readManifest(path).stateDefinition.migration).toBe(
        "state.migration.ts",
      );
      expect(readLock(path)).toEqual(lock);
    });

    it("records a successful migration even if the subsequent permissions update fails", async () => {
      // Setup mocks
      backend.apps.updatePermissions = vi.fn(async () => {
        throw new Error("Permissions update failed");
      });
      // Setup SUT
      manifest.permissions = { ...manifest.permissions, downloads: true };
      manifest.stateDefinition.migration = "state.migration.ts";
      await writeManifest(path, manifest);

      // Exercise
      const commit = updateApp({
        backend,
        path,
        manifest,
        lock: readLock(path)!,
      });

      // Verify
      await expect(commit).rejects.toThrow("Permissions update failed");
      expect(readManifest(path).stateDefinition.migration).toBeNull();
      expect(readLock(path)).toEqual(buildLock(app));
      expect(readLock(path)?.latestAppVersionId).toBe(
        "AppVersion_original_next",
      );
    });

    it("clears the migration after creating an app so the next commit is clean", async () => {
      // Setup mocks
      backend.apps.create = vi.fn(async () => makeSuccessfulResult(app));
      // Setup SUT
      manifest.stateDefinition.migration = "state.migration.ts";
      await writeManifest(path, manifest);

      // Exercise
      await createApp({ backend, path, manifest });
      const nextCommit = await updateApp({
        backend,
        path,
        manifest: readManifest(path),
        lock: readLock(path)!,
      });

      // Verify
      expect(readManifest(path).stateDefinition.migration).toBeNull();
      expect(nextCommit.operations).toEqual(["nothing to commit"]);
      expect(createNewVersion).not.toHaveBeenCalled();
    });
  });
});
