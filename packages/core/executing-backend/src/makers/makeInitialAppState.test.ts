import type { AppStateDefinition } from "@superego/backend";
import { DataType } from "@superego/schema";
import { emptyAppStateDefinition } from "@superego/shared-utils";
import { expect, it } from "vitest";
import makeInitialAppState from "./makeInitialAppState.js";

const definition: AppStateDefinition = {
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
};

it("initializes state without applying a migration", () => {
  // Exercise
  const result = makeInitialAppState(null, {
    ...definition,
    migration: {
      source: "",
      compiled: "export default () => ({ count: 99 });",
    },
  });

  // Verify
  expect(result).toEqual({
    success: true,
    data: {
      content: { count: 0 },
      revision: 1,
    },
    error: null,
  });
});

it("initializes empty state", () => {
  // Exercise
  const result = makeInitialAppState(null, emptyAppStateDefinition);

  // Verify
  expect(result).toEqual({
    success: true,
    data: { content: {}, revision: 1 },
    error: null,
  });
});

it("retains semantic schema validation issues", () => {
  // Exercise
  const result = makeInitialAppState(null, {
    ...definition,
    schema: { ...definition.schema, rootType: "Missing" },
  });

  // Verify
  expect(result.error).toEqual({
    name: "AppStateSchemaNotValid",
    details: {
      appId: null,
      issues: expect.arrayContaining([
        expect.objectContaining({ message: expect.any(String) }),
      ]),
    },
  });
});

it("identifies invalid initial content by app and property path", () => {
  // Exercise
  const result = makeInitialAppState("App_existing", {
    ...definition,
    initialState: { count: "invalid" },
  });

  // Verify
  expect(result.error).toEqual({
    name: "AppStateContentNotValid",
    details: {
      appId: "App_existing",
      issues: [
        expect.objectContaining({
          message: expect.any(String),
          path: [{ key: "count" }],
        }),
      ],
    },
  });
});
