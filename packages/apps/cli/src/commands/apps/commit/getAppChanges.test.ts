import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AppType, type App, type AppStateDefinition } from "@superego/backend";
import { DataType } from "@superego/schema";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CliBackend } from "../common/commandUtils.js";
import { readManifest, writeManifest } from "../common/manifest.js";
import { writeStateDefinitionSource } from "../common/stateDefinition.js";
import getAppChanges from "./getAppChanges.js";

vi.mock("../common/compile.js", () => ({
  compileApp: vi.fn(async () => ({ source: "source", compiled: "compiled" })),
}));

describe("getAppChanges", () => {
  let path: string;
  let stateDefinition: AppStateDefinition;
  let app: App;

  beforeEach(async () => {
    path = mkdtempSync(join(tmpdir(), "superego-app-changes-"));
    stateDefinition = {
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
        source: "export default (state: any) => state;",
        compiled: "compiled",
      },
    };
    app = {
      id: "App_test",
      name: "App",
      type: AppType.CollectionView,
      createdAt: new Date(),
      permissions: {
        downloads: false,
        http: { allowedOrigins: [] },
        modals: true,
      },
      latestVersion: {
        id: "AppVersion_test",
        createdAt: new Date(),
        targetCollections: [],
        files: {
          "/main.tsx": { source: "source", compiled: "different compilation" },
        },
        stateDefinition,
      },
    };
    writeFileSync(join(path, "main.tsx"), "source");
    await writeManifest(path, {
      name: app.name,
      type: app.type,
      targetCollectionIds: [],
      permissions: {
        downloads: false,
        http: { allowedOrigins: [] },
        modals: true,
      },
      stateDefinition: {
        schema: "state.schema.json",
        initialState: "state.initial.json",
        migration: null,
      },
    });
    await writeStateDefinitionSource(path, stateDefinition);
  });

  afterEach(() => {
    rmSync(path, { recursive: true });
  });

  it("ignores historical migrations and compiled output on a clean checkout", async () => {
    // Exercise
    const changes = await getAppChanges({
      backend: {} as CliBackend,
      path,
      manifest: readManifest(path),
      app,
    });

    // Verify
    expect(changes.sourceChanged).toBe(false);
    expect(changes.targetCollectionsChanged).toBe(false);
    expect(changes.permissionsChanged).toBe(false);
    expect(changes.stateDefinitionChanged).toBe(false);
    expect(changes.mainModule).toBeNull();
  });

  it("detects changed permissions without recompiling the app", async () => {
    // Setup SUT
    const manifest = readManifest(path);
    manifest.permissions.modals = false;
    await writeManifest(path, manifest);

    // Exercise
    const changes = await getAppChanges({
      backend: {} as CliBackend,
      path,
      manifest: readManifest(path),
      app,
    });

    // Verify
    expect(changes.sourceChanged).toBe(false);
    expect(changes.targetCollectionsChanged).toBe(false);
    expect(changes.permissionsChanged).toBe(true);
    expect(changes.stateDefinitionChanged).toBe(false);
    expect(changes.mainModule).toBeNull();
  });

  it("detects a changed state schema independently of compiled output", async () => {
    // Setup SUT
    const changedStateDefinition = structuredClone(stateDefinition);
    changedStateDefinition.schema.types["State"]!.description =
      "Updated schema";
    await writeStateDefinitionSource(path, changedStateDefinition);

    // Exercise
    const changes = await getAppChanges({
      backend: {} as CliBackend,
      path,
      manifest: readManifest(path),
      app,
    });

    // Verify
    expect(changes.sourceChanged).toBe(false);
    expect(changes.targetCollectionsChanged).toBe(false);
    expect(changes.permissionsChanged).toBe(false);
    expect(changes.stateDefinitionChanged).toBe(true);
    expect(changes.mainModule).not.toBeNull();
  });

  it("detects a changed initial state independently of compiled output", async () => {
    // Setup SUT
    const changedStateDefinition = structuredClone(stateDefinition);
    changedStateDefinition.initialState = { count: 1 };
    await writeStateDefinitionSource(path, changedStateDefinition);

    // Exercise
    const changes = await getAppChanges({
      backend: {} as CliBackend,
      path,
      manifest: readManifest(path),
      app,
    });

    // Verify
    expect(changes.sourceChanged).toBe(false);
    expect(changes.targetCollectionsChanged).toBe(false);
    expect(changes.permissionsChanged).toBe(false);
    expect(changes.stateDefinitionChanged).toBe(true);
    expect(changes.mainModule).not.toBeNull();
  });

  it("detects changed migration source independently of compiled output", async () => {
    // Setup SUT
    const manifest = readManifest(path);
    manifest.stateDefinition.migration = "state.migration.ts";
    await writeManifest(path, manifest);
    const changedStateDefinition = structuredClone(stateDefinition);
    changedStateDefinition.migration!.source =
      "export default () => ({ count: 2 });";
    await writeStateDefinitionSource(path, changedStateDefinition);

    // Exercise
    const changes = await getAppChanges({
      backend: {} as CliBackend,
      path,
      manifest: readManifest(path),
      app,
    });

    // Verify
    expect(changes.sourceChanged).toBe(false);
    expect(changes.targetCollectionsChanged).toBe(false);
    expect(changes.permissionsChanged).toBe(false);
    expect(changes.stateDefinitionChanged).toBe(true);
    expect(changes.mainModule).not.toBeNull();
  });

  it("detects a pending migration even if its source matches the previous version", async () => {
    // Setup SUT
    const manifest = readManifest(path);
    manifest.stateDefinition.migration = "state.migration.ts";
    await writeManifest(path, manifest);

    // Exercise
    const changes = await getAppChanges({
      backend: {} as CliBackend,
      path,
      manifest,
      app,
    });

    // Verify
    expect(changes.stateDefinitionChanged).toBe(true);
    expect(changes.mainModule).not.toBeNull();
  });
});
