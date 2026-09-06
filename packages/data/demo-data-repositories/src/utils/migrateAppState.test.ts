import { expect, it } from "vitest";
import type Data from "../Data.js";
import migrateAppState from "./migrateAppState.js";

it("backfills demo app state and preserves existing content and definitions", () => {
  // Setup SUT
  const definition = {
    schema: { types: {}, rootType: "State" },
    initialState: { count: 0 },
  };
  const data = {
    apps: {
      App_empty: {},
      App_saved: {
        state: {
          content: { count: 42 },
          revision: 7,
          schemaId: "AppVersion_old",
        },
      },
    },
    appVersions: {
      AppVersion_empty: { permissions: { downloads: true } },
      AppVersion_saved: { state: definition, stateSchemaId: "AppVersion_old" },
    },
  } as unknown as Data;

  // Exercise
  migrateAppState(data);
  migrateAppState(data);

  // Verify
  expect(data.apps["App_empty"]?.state).toEqual({ content: {}, revision: 1 });
  expect(data.apps["App_saved"]?.state).toEqual({
    content: { count: 42 },
    revision: 7,
  });
  expect(data.appVersions["AppVersion_empty"]).toEqual({
    permissions: { downloads: true },
    state: {
      schema: {
        types: { State: { dataType: "Struct", properties: {} } },
        rootType: "State",
      },
      initialState: {},
    },
  });
  expect(data.appVersions["AppVersion_saved"]).toEqual({ state: definition });
});
