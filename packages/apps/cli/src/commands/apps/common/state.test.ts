import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AppType, type AppStateDefinition } from "@superego/backend";
import { DataType } from "@superego/schema";
import { expect, it } from "vitest";
import { readManifest, writeManifest } from "./manifest.js";
import { readStateSource, stateSourceOf, writeStateSource } from "./state.js";

it("round-trips permissions and state source independently of saved content", async () => {
  // Setup SUT
  const path = mkdtempSync(join(tmpdir(), "superego-app-sources-"));
  const state: AppStateDefinition = {
    schema: {
      types: {
        State: {
          dataType: DataType.Struct,
          properties: { url: { dataType: DataType.String } },
        },
      },
      rootType: "State",
    },
    initialState: { url: "https://example.com" },
    migration: {
      source: "export default (previous: any) => previous;",
      compiled: "unused",
    },
  };
  try {
    // Exercise
    await writeManifest(path, {
      name: "App",
      type: AppType.CollectionView,
      targetCollectionIds: [],
      permissions: {
        downloads: true,
        http: { allowedOrigins: ["HTTPS://EXAMPLE.COM:443"] },
      },
      state: {
        schema: "state.schema.json",
        initialState: "state.initial.json",
        migration: "state.migration.ts",
      },
    });
    await writeStateSource(path, state);
    const manifest = readManifest(path);
    const source = readStateSource(path);
    // Verify
    expect(manifest.permissions).toEqual({
      downloads: true,
      http: { allowedOrigins: ["https://example.com"] },
    });
    expect(source).toEqual(stateSourceOf(state));
    expect(source).not.toHaveProperty("revision");
    expect(source).not.toHaveProperty("schemaId");
    expect(source).not.toHaveProperty("content");
  } finally {
    rmSync(path, { recursive: true });
  }
});
