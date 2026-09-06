import { DatabaseSync } from "node:sqlite";
import { decode, encode } from "@msgpack/msgpack";
import { expect, it } from "vitest";
import migrate from "./migrate.js";

it("backfills all app versions and preserves saved state when upgrading existing databases", () => {
  // Setup SUT
  const database = new DatabaseSync(":memory:");
  migrate(database);
  database
    .prepare("DELETE FROM migrations WHERE file_name >= ?")
    .run("0013.ts");
  const definition = {
    schema: {
      types: {
        State: {
          dataType: "Struct",
          properties: { count: { dataType: "Number" } },
        },
      },
      rootType: "State",
    },
    initialState: { count: 0 },
    migration: { source: "source", compiled: "compiled" },
  };
  const insertApp = database.prepare(
    "INSERT INTO apps (id, type, name, created_at, state) VALUES (?, ?, ?, ?, ?)",
  );
  insertApp.run("App_empty", "CollectionView", "Empty", "2026-09-06", null);
  insertApp.run(
    "App_saved",
    "CollectionView",
    "Saved",
    "2026-09-06",
    encode({
      content: { count: 42 },
      revision: 7,
      schemaId: "AppVersion_old",
    }),
  );
  const insertVersion = database.prepare(
    "INSERT INTO app_versions (id, app_id, target_collections, files, created_at, is_latest, definition_options) VALUES (?, ?, ?, ?, ?, ?, ?)",
  );
  insertVersion.run(
    "AppVersion_old",
    "App_empty",
    encode([]),
    encode({}),
    "2026-09-05",
    0,
    null,
  );
  insertVersion.run(
    "AppVersion_empty",
    "App_empty",
    encode([]),
    encode({}),
    "2026-09-06",
    1,
    encode({ permissions: { downloads: true }, state: null }),
  );
  insertVersion.run(
    "AppVersion_saved",
    "App_saved",
    encode([]),
    encode({}),
    "2026-09-06",
    1,
    encode({ state: definition, stateSchemaId: "AppVersion_old" }),
  );

  try {
    // Exercise
    migrate(database);
    migrate(database);
    const apps = database
      .prepare("SELECT id, state FROM apps ORDER BY id")
      .all() as { id: string; state: Uint8Array }[];
    const versions = database
      .prepare("SELECT id, definition_options FROM app_versions ORDER BY id")
      .all() as { id: string; definition_options: Uint8Array }[];

    // Verify
    expect(apps.map((app) => decode(app.state))).toEqual([
      { content: {}, revision: 1 },
      { content: { count: 42 }, revision: 7 },
    ]);
    const emptyDefinition = {
      schema: {
        types: { State: { dataType: "Struct", properties: {} } },
        rootType: "State",
      },
      initialState: {},
      migration: null,
    };
    expect(
      versions.map((version) => decode(version.definition_options)),
    ).toEqual([
      {
        permissions: {
          modals: false,
          downloads: true,
          http: { allowedOrigins: [] },
        },
        stateDefinition: emptyDefinition,
      },
      {
        permissions: {
          modals: false,
          downloads: false,
          http: { allowedOrigins: [] },
        },
        stateDefinition: emptyDefinition,
      },
      {
        permissions: {
          modals: false,
          downloads: false,
          http: { allowedOrigins: [] },
        },
        stateDefinition: definition,
      },
    ]);
    expect(
      database
        .prepare("SELECT COUNT(*) AS count FROM migrations WHERE file_name = ?")
        .get("0013.ts")?.["count"],
    ).toBe(1);
  } finally {
    database.close();
  }
});

it("upgrades an already initialized app definition without resetting state or granted permissions", () => {
  // Setup SUT
  const database = new DatabaseSync(":memory:");
  migrate(database);
  database.prepare("DELETE FROM migrations WHERE file_name = ?").run("0014.ts");
  const stateDefinition = {
    schema: {
      types: {
        State: {
          dataType: "Struct",
          properties: { count: { dataType: "Number" } },
        },
      },
      rootType: "State",
    },
    initialState: { count: 0 },
  };
  const permissions = {
    modals: true,
    downloads: true,
    http: { allowedOrigins: ["https://example.com"] },
  };
  database
    .prepare(
      "INSERT INTO apps (id, type, name, created_at, state) VALUES (?, ?, ?, ?, ?)",
    )
    .run(
      "App_saved",
      "CollectionView",
      "Saved",
      "2026-09-06",
      encode({ content: { count: 42 }, revision: 7 }),
    );
  database
    .prepare(
      "INSERT INTO app_versions (id, app_id, target_collections, files, created_at, is_latest, definition_options) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .run(
      "AppVersion_saved",
      "App_saved",
      encode([]),
      encode({}),
      "2026-09-06",
      1,
      encode({ permissions, state: stateDefinition }),
    );

  try {
    // Exercise
    migrate(database);
    const app = database.prepare("SELECT state FROM apps").get() as {
      state: Uint8Array;
    };
    const version = database
      .prepare("SELECT definition_options FROM app_versions")
      .get() as { definition_options: Uint8Array };

    // Verify
    expect(decode(app.state)).toEqual({ content: { count: 42 }, revision: 7 });
    expect(decode(version.definition_options)).toEqual({
      permissions,
      stateDefinition: { ...stateDefinition, migration: null },
    });
  } finally {
    database.close();
  }
});
