import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AppType, type AppStateDefinition } from "@superego/backend";
import { DataType } from "@superego/schema";
import { defaultAppPermissions } from "@superego/shared-utils";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { regenerateGeneratedFiles } from "../common/generatedFiles.js";
import { writeManifest } from "../common/manifest.js";
import { writeStateDefinitionSource } from "../common/stateDefinition.js";
import checkApp from "./checkApp.js";

describe("checkApp", () => {
  let path: string;
  let stateDefinition: AppStateDefinition;

  beforeEach(async () => {
    path = mkdtempSync(join(tmpdir(), "superego-check-app-"));
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
      migration: null,
    };
    await writeManifest(path, {
      name: "App",
      type: AppType.CollectionView,
      targetCollectionIds: [],
      permissions: defaultAppPermissions,
      stateDefinition: {
        schema: "state.schema.json",
        initialState: "state.initial.json",
        migration: null,
      },
    });
    await writeStateDefinitionSource(path, stateDefinition);
    await regenerateGeneratedFiles(path, []);
  });

  afterEach(() => {
    rmSync(path, { recursive: true });
  });

  it.each([false, true])(
    "refreshes state types after a schema edit (app compilation fails: %s)",
    async (compilationFails) => {
      // Setup SUT
      stateDefinition.schema.types["State"] = {
        dataType: DataType.Struct,
        properties: { label: { dataType: DataType.String } },
      };
      stateDefinition.initialState = { label: "updated" };
      await writeStateDefinitionSource(path, stateDefinition);
      writeFileSync(
        join(path, "main.tsx"),
        `import type { State } from "./app-state.js";
export default (state: State): string => state.${compilationFails ? "count" : "label"};`,
      );

      // Exercise
      const check = checkApp(path, []);

      // Verify
      if (compilationFails) {
        await expect(check).rejects.toThrow("Property 'count' does not exist");
      } else {
        await expect(check).resolves.toBeUndefined();
      }
      const generatedTypes = readFileSync(join(path, "app-state.ts"), "utf8");
      expect(generatedTypes).toContain("label: string");
      expect(generatedTypes).not.toContain("count: number");
    },
  );

  it("leaves generated files intact when the state definition is invalid", async () => {
    // Setup SUT
    const generatedTypes = readFileSync(join(path, "app-state.ts"), "utf8");
    writeFileSync(join(path, "state.initial.json"), "{}");
    writeFileSync(join(path, "Collection_existing.ts"), "existing types");

    // Exercise
    const check = checkApp(path, []);

    // Verify
    await expect(check).rejects.toThrow(
      "Initial state must match the state schema.",
    );
    expect(readFileSync(join(path, "app-state.ts"), "utf8")).toBe(
      generatedTypes,
    );
    expect(readFileSync(join(path, "Collection_existing.ts"), "utf8")).toBe(
      "existing types",
    );
  });
});
