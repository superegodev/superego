import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AppType } from "@superego/backend";
import { defaultAppPermissions } from "@superego/shared-utils";
import { ValiError } from "valibot";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readManifest, writeManifest } from "./manifest.js";
import type { AppManifest } from "./types.js";

let path: string;
let manifest: AppManifest;

beforeEach(() => {
  path = mkdtempSync(join(tmpdir(), "superego-app-manifest-"));
  manifest = {
    name: "App",
    type: AppType.CollectionView,
    targetCollectionIds: [],
    permissions: defaultAppPermissions,
    stateDefinition: {
      schema: "state.schema.json",
      initialState: "state.initial.json",
      migration: null,
    },
  };
});

afterEach(() => {
  rmSync(path, { recursive: true });
});

function writeManifestJson(data: unknown): void {
  writeFileSync(join(path, "app.json"), JSON.stringify(data));
}

describe("writeManifest", () => {
  it("writes permissions and state file references to app.json", async () => {
    // Setup SUT
    manifest.permissions = {
      modals: false,
      downloads: true,
      http: { allowedOrigins: ["https://example.com"] },
    };
    manifest.stateDefinition.migration = "state.migration.ts";

    // Exercise
    await writeManifest(path, manifest);

    // Verify
    expect(JSON.parse(readFileSync(join(path, "app.json"), "utf8"))).toEqual(
      manifest,
    );
  });
});

describe("readManifest", () => {
  it("reads permissions and state file references", () => {
    // Setup SUT
    manifest.permissions = {
      modals: false,
      downloads: true,
      http: { allowedOrigins: ["https://example.com"] },
    };
    manifest.stateDefinition.migration = "state.migration.ts";
    writeManifestJson(manifest);

    // Exercise
    const result = readManifest(path);

    // Verify
    expect(result).toEqual(manifest);
  });

  it("accepts an explicit null migration", () => {
    // Setup SUT
    writeManifestJson(manifest);

    // Exercise
    const result = readManifest(path);

    // Verify
    expect(result).toEqual(manifest);
    expect(result.stateDefinition.migration).toBeNull();
  });

  it("returns the original data with plain string collection IDs and extra fields", () => {
    // Setup SUT
    const data = {
      ...manifest,
      targetCollectionIds: ["local-collection"],
      description: "Preserve additional manifest metadata",
    };
    writeManifestJson(data);

    // Exercise
    const result = readManifest(path);

    // Verify
    expect(result).toEqual(data);
  });

  it("rejects a non-object manifest", () => {
    // Setup SUT
    writeManifestJson(null);

    // Exercise
    const read = () => readManifest(path);

    // Verify
    expect(read).toThrow(ValiError);
  });

  it("rejects a non-string name", () => {
    // Setup SUT
    writeManifestJson({ ...manifest, name: 123 });

    // Exercise
    const read = () => readManifest(path);

    // Verify
    expect(read).toThrow(ValiError);
  });

  it("rejects an unsupported app type", () => {
    // Setup SUT
    writeManifestJson({ ...manifest, type: "Unsupported" });

    // Exercise
    const read = () => readManifest(path);

    // Verify
    expect(read).toThrow(ValiError);
  });

  it("rejects a non-array target collection list", () => {
    // Setup SUT
    writeManifestJson({ ...manifest, targetCollectionIds: "Collection_test" });

    // Exercise
    const read = () => readManifest(path);

    // Verify
    expect(read).toThrow(ValiError);
  });

  it("rejects non-string target collection IDs", () => {
    // Setup SUT
    writeManifestJson({ ...manifest, targetCollectionIds: [123] });

    // Exercise
    const read = () => readManifest(path);

    // Verify
    expect(read).toThrow(ValiError);
  });

  it("rejects missing permissions", () => {
    // Setup SUT
    writeManifestJson({ ...manifest, permissions: undefined });

    // Exercise
    const read = () => readManifest(path);

    // Verify
    expect(read).toThrow(ValiError);
  });

  it("preserves the validation error for invalid HTTP origins", () => {
    // Setup SUT
    writeManifestJson({
      ...manifest,
      permissions: {
        ...defaultAppPermissions,
        http: { allowedOrigins: ["https://example.com/"] },
      },
    });

    // Exercise
    const read = () => readManifest(path);

    // Verify
    expect(read).toThrow(
      "Expected a normalized HTTP(S) origin without a trailing slash.",
    );
  });

  it("rejects an incorrect state schema file", () => {
    // Setup SUT
    writeManifestJson({
      ...manifest,
      stateDefinition: { ...manifest.stateDefinition, schema: "other.json" },
    });

    // Exercise
    const read = () => readManifest(path);

    // Verify
    expect(read).toThrow(ValiError);
  });

  it("rejects an incorrect initial state file", () => {
    // Setup SUT
    writeManifestJson({
      ...manifest,
      stateDefinition: {
        ...manifest.stateDefinition,
        initialState: "other.json",
      },
    });

    // Exercise
    const read = () => readManifest(path);

    // Verify
    expect(read).toThrow(ValiError);
  });

  it("rejects an incorrect migration file", () => {
    // Setup SUT
    writeManifestJson({
      ...manifest,
      stateDefinition: { ...manifest.stateDefinition, migration: "other.ts" },
    });

    // Exercise
    const read = () => readManifest(path);

    // Verify
    expect(read).toThrow(ValiError);
  });

  it("rejects a missing migration declaration", () => {
    // Setup SUT
    writeManifestJson({
      ...manifest,
      stateDefinition: { ...manifest.stateDefinition, migration: undefined },
    });

    // Exercise
    const read = () => readManifest(path);

    // Verify
    expect(read).toThrow(ValiError);
  });

  it("rejects unexpected state definition fields", () => {
    // Setup SUT
    writeManifestJson({
      ...manifest,
      stateDefinition: { ...manifest.stateDefinition, revision: 1 },
    });

    // Exercise
    const read = () => readManifest(path);

    // Verify
    expect(read).toThrow(ValiError);
  });

  it("preserves JSON syntax errors", () => {
    // Setup SUT
    writeFileSync(join(path, "app.json"), "{");

    // Exercise
    const read = () => readManifest(path);

    // Verify
    expect(read).toThrow(SyntaxError);
  });

  it("preserves file read errors", () => {
    // Exercise
    const read = () => readManifest(path);

    // Verify
    expect(read).toThrow(expect.objectContaining({ code: "ENOENT" }));
  });
});
