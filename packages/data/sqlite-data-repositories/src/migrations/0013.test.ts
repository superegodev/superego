import { DatabaseSync } from "node:sqlite";
import { decode, encode } from "@msgpack/msgpack";
import { expect, it } from "vitest";
import moveAppPermissions from "./0013.js";

it("preserves each app's latest permissions while removing version permissions", () => {
  // Setup SUT
  const database = new DatabaseSync(":memory:");
  database.exec(`
    CREATE TABLE apps (id TEXT PRIMARY KEY, state BLOB NOT NULL);
    CREATE TABLE app_versions (id TEXT PRIMARY KEY, app_id TEXT NOT NULL, is_latest INTEGER NOT NULL, permissions BLOB NOT NULL);
  `);
  const restrictive = {
    modals: false,
    downloads: false,
    http: { allowedOrigins: [] },
  };
  const permissions = {
    modals: true,
    downloads: true,
    http: { allowedOrigins: ["http://192.168.1.10:8080"] },
  };
  const state = { content: { device: "selected" }, revision: 3 };
  const insertApp = database.prepare("INSERT INTO apps VALUES (?, ?)");
  insertApp.run("devices", encode(state));
  insertApp.run("other", encode(state));
  insertApp.run("without-version", encode(state));
  const insertVersion = database.prepare(
    "INSERT INTO app_versions VALUES (?, ?, ?, ?)",
  );
  insertVersion.run("old", "devices", 0, encode(restrictive));
  insertVersion.run("latest", "devices", 1, encode(permissions));
  insertVersion.run("other", "other", 1, encode(restrictive));

  try {
    // Exercise
    moveAppPermissions(database);

    // Verify
    const apps = database.prepare("SELECT * FROM apps ORDER BY id").all() as {
      id: string;
      state: Uint8Array;
      permissions: Uint8Array;
    }[];
    expect(
      apps.map((app) => ({
        id: app.id,
        state: decode(app.state),
        permissions: decode(app.permissions),
      })),
    ).toEqual([
      { id: "devices", state, permissions },
      { id: "other", state, permissions: restrictive },
      { id: "without-version", state, permissions: restrictive },
    ]);
    expect(
      database.prepare("SELECT * FROM app_versions ORDER BY id").all(),
    ).toEqual([
      { id: "latest", app_id: "devices", is_latest: 1 },
      { id: "old", app_id: "devices", is_latest: 0 },
      { id: "other", app_id: "other", is_latest: 1 },
    ]);
  } finally {
    database.close();
  }
});
