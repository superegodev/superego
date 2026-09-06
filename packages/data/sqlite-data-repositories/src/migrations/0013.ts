import type { DatabaseSync } from "node:sqlite";
import { decode, encode } from "@msgpack/msgpack";

export default function migrateAppState(database: DatabaseSync) {
  const emptyDefinition = {
    schema: {
      types: { State: { dataType: "Struct", properties: {} } },
      rootType: "State",
    },
    initialState: {},
  };
  const apps = database.prepare("SELECT id, state FROM apps").all() as {
    id: string;
    state: Uint8Array | null;
  }[];
  const updateApp = database.prepare("UPDATE apps SET state = ? WHERE id = ?");
  for (const app of apps) {
    const state = app.state
      ? (decode(app.state) as {
          content: Record<string, unknown>;
          revision: number;
        })
      : { content: {}, revision: 1 };
    updateApp.run(
      encode({ content: state.content, revision: state.revision }),
      app.id,
    );
  }
  const versions = database
    .prepare("SELECT id, definition_options FROM app_versions")
    .all() as {
    id: string;
    definition_options: Uint8Array | null;
  }[];
  const updateVersion = database.prepare(
    "UPDATE app_versions SET definition_options = ? WHERE id = ?",
  );
  for (const version of versions) {
    const options = version.definition_options
      ? (decode(version.definition_options) as Record<string, unknown>)
      : {};
    delete options["stateSchemaId"];
    options["state"] ??= emptyDefinition;
    updateVersion.run(encode(options), version.id);
  }
}
