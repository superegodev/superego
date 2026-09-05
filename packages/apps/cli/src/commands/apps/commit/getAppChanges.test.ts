import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AppType, type App, type AppStateDefinition } from "@superego/backend";
import { DataType } from "@superego/schema";
import { expect, it, vi } from "vitest";
import type { CliBackend } from "../common/commandUtils.js";
import { readManifest, writeManifest } from "../common/manifest.js";
import { writeStateSource } from "../common/state.js";
import getAppChanges from "./getAppChanges.js";

vi.mock("../common/compile.js", () => ({
  compileApp: vi.fn(async () => ({ source: "source", compiled: "compiled" })),
}));

it.each(["unchanged", "permissions", "schema", "initialState", "migration"])(
  "detects %s independently of compiled output and saved state",
  async (change) => {
    // Setup SUT
    const path = mkdtempSync(join(tmpdir(), "superego-app-changes-"));
    const state: AppStateDefinition = {
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
    const app: App = {
      id: "App_test",
      name: "App",
      type: AppType.CollectionView,
      createdAt: new Date(),
      latestVersion: {
        id: "AppVersion_test",
        createdAt: new Date(),
        targetCollections: [],
        files: {
          "/main.tsx": { source: "source", compiled: "different compilation" },
        },
        permissions: { modals: true },
        state,
      },
    };
    try {
      writeFileSync(join(path, "main.tsx"), "source");
      const changedState = structuredClone(state);
      if (change === "initialState") {
        changedState.initialState = { count: 1 };
      }
      if (change === "migration") {
        changedState.migration!.source = "export default () => ({ count: 2 });";
      }
      if (change === "schema") {
        changedState.schema.types["State"]!.description = "Updated schema";
      }
      await writeManifest(path, {
        name: app.name,
        type: app.type,
        targetCollectionIds: [],
        permissions: { modals: change !== "permissions" },
        state: {
          schema: "state.schema.json",
          initialState: "state.initial.json",
          migration: "state.migration.ts",
        },
      });
      await writeStateSource(path, changedState);
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
      expect(changes.permissionsChanged).toBe(change === "permissions");
      expect(changes.stateChanged).toBe(
        ["schema", "initialState", "migration"].includes(change),
      );
      expect(changes.mainModule !== null).toBe(change !== "unchanged");
    } finally {
      rmSync(path, { recursive: true });
    }
  },
);
