import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AppType, type AppStateDefinition } from "@superego/backend";
import { DataType } from "@superego/schema";
import { defaultAppPermissions } from "@superego/shared-utils";
import { ValiError } from "valibot";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readManifest } from "./manifest.js";
import {
  clearPendingMigration,
  compileStateDefinition,
  readStateDefinitionSource,
  stateDefinitionSourceOf,
  writeStateDefinitionSource,
} from "./stateDefinition.js";

let path: string;
let definition: AppStateDefinition;
const migrationSource = `import type { State } from "./app-state.js";
export default (previous: State): State => ({ count: previous.count + 1 });`;

beforeEach(() => {
  path = mkdtempSync(join(tmpdir(), "superego-app-state-definition-"));
  definition = {
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
    migration: { source: migrationSource, compiled: "previously compiled" },
  };
});

afterEach(() => {
  rmSync(path, { recursive: true });
});

function writeSourceFixture(): void {
  writeFileSync(
    join(path, "app.json"),
    JSON.stringify({
      name: "App",
      type: AppType.CollectionView,
      targetCollectionIds: [],
      permissions: defaultAppPermissions,
      stateDefinition: {
        schema: "state.schema.json",
        initialState: "state.initial.json",
        migration: definition.migration ? "state.migration.ts" : null,
      },
    }),
  );
  writeFileSync(
    join(path, "state.schema.json"),
    JSON.stringify(definition.schema),
  );
  writeFileSync(
    join(path, "state.initial.json"),
    JSON.stringify(definition.initialState),
  );
  if (definition.migration) {
    writeFileSync(
      join(path, "state.migration.ts"),
      definition.migration.source,
    );
  }
}

describe("readStateDefinitionSource", () => {
  it("reads the schema, initial state, and migration source", () => {
    // Setup SUT
    writeSourceFixture();

    // Exercise
    const source = readStateDefinitionSource(path);

    // Verify
    expect(source).toEqual({
      schema: definition.schema,
      initialState: { count: 0 },
      migration: migrationSource,
    });
  });

  it("reads a definition without a migration source file", () => {
    // Setup SUT
    definition.migration = null;
    writeSourceFixture();

    // Exercise
    const source = readStateDefinitionSource(path);

    // Verify
    expect(source).toEqual({
      schema: definition.schema,
      initialState: { count: 0 },
      migration: null,
    });
  });

  it("rejects an invalid state schema", () => {
    // Setup SUT
    writeSourceFixture();
    writeFileSync(
      join(path, "state.schema.json"),
      JSON.stringify({ types: {} }),
    );

    // Exercise
    const readSource = () => readStateDefinitionSource(path);

    // Verify
    expect(readSource).toThrow(ValiError);
  });

  it("rejects a schema containing file state", () => {
    // Setup SUT
    writeSourceFixture();
    writeFileSync(
      join(path, "state.schema.json"),
      JSON.stringify({
        types: {
          State: {
            dataType: DataType.Struct,
            properties: { attachment: { dataType: DataType.File } },
          },
        },
        rootType: "State",
      }),
    );

    // Exercise
    const readSource = () => readStateDefinitionSource(path);

    // Verify
    expect(readSource).toThrow(
      "App state cannot contain File or DocumentRef types.",
    );
  });

  it("rejects initial state that does not match the schema", () => {
    // Setup SUT
    definition.initialState = { count: "zero" };
    writeSourceFixture();

    // Exercise
    const readSource = () => readStateDefinitionSource(path);

    // Verify
    expect(readSource).toThrow("Initial state must match the state schema.");
  });

  it("rejects a missing migration source declared in the manifest", () => {
    // Setup SUT
    writeSourceFixture();
    rmSync(join(path, "state.migration.ts"));

    // Exercise
    const readSource = () => readStateDefinitionSource(path);

    // Verify
    expect(readSource).toThrow(expect.objectContaining({ code: "ENOENT" }));
  });
});

describe("stateDefinitionSourceOf", () => {
  it("extracts the schema, initial state, and migration source", () => {
    // Exercise
    const source = stateDefinitionSourceOf(definition);

    // Verify
    expect(source).toEqual({
      schema: definition.schema,
      initialState: { count: 0 },
      migration: migrationSource,
    });
  });

  it("preserves a null migration", () => {
    // Setup SUT
    definition.migration = null;

    // Exercise
    const source = stateDefinitionSourceOf(definition);

    // Verify
    expect(source).toEqual({
      schema: definition.schema,
      initialState: { count: 0 },
      migration: null,
    });
  });
});

describe("writeStateDefinitionSource", () => {
  it("writes the schema, initial state, and original migration source", async () => {
    // Exercise
    await writeStateDefinitionSource(path, definition);

    // Verify
    expect(
      JSON.parse(readFileSync(join(path, "state.schema.json"), "utf8")),
    ).toEqual(definition.schema);
    expect(
      JSON.parse(readFileSync(join(path, "state.initial.json"), "utf8")),
    ).toEqual({ count: 0 });
    expect(readFileSync(join(path, "state.migration.ts"), "utf8")).toBe(
      migrationSource,
    );
  });

  it("writes only schema and initial state files for a null migration", async () => {
    // Setup SUT
    definition.migration = null;

    // Exercise
    await writeStateDefinitionSource(path, definition);

    // Verify
    expect(readdirSync(path).sort()).toEqual([
      "state.initial.json",
      "state.schema.json",
    ]);
    expect(
      JSON.parse(readFileSync(join(path, "state.initial.json"), "utf8")),
    ).toEqual({ count: 0 });
  });
});

describe("clearPendingMigration", () => {
  it("clears the reference while preserving the manifest and migration source", async () => {
    // Setup SUT
    writeSourceFixture();
    const manifest = readManifest(path);

    // Exercise
    await clearPendingMigration(path);

    // Verify
    expect(readManifest(path)).toEqual({
      ...manifest,
      stateDefinition: { ...manifest.stateDefinition, migration: null },
    });
    expect(readFileSync(join(path, "state.migration.ts"), "utf8")).toBe(
      migrationSource,
    );
    expect((await compileStateDefinition(path)).migration).toBeNull();
  });
});

describe("compileStateDefinition", () => {
  it("preserves a definition with a null migration", async () => {
    // Setup SUT
    definition.migration = null;
    writeSourceFixture();

    // Exercise
    const compiledDefinition = await compileStateDefinition(path);

    // Verify
    expect(compiledDefinition).toEqual(definition);
  });

  it("compiles migration source using types generated from the state schema", async () => {
    // Setup SUT
    writeSourceFixture();

    // Exercise
    const compiledDefinition = await compileStateDefinition(path);

    // Verify
    expect(compiledDefinition).toEqual({
      schema: definition.schema,
      initialState: { count: 0 },
      migration: {
        source: migrationSource,
        compiled: expect.stringContaining(
          "export default (previous) => ({ count: previous.count + 1 });",
        ),
      },
    });
  });

  it("rejects a migration with a state schema type error", async () => {
    // Setup SUT
    writeSourceFixture();
    writeFileSync(
      join(path, "state.migration.ts"),
      `import type { State } from "./app-state.js";
export default (): State => ({ count: "zero" });`,
    );

    // Exercise
    const compilation = compileStateDefinition(path);

    // Verify
    await expect(compilation).rejects.toThrow("TypescriptCompilationFailed");
    await expect(compilation).rejects.toThrow(
      "Type 'string' is not assignable to type 'number'",
    );
  });
});
