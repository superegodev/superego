import type { AppStateDefinition } from "@superego/backend";
import { DataType } from "@superego/schema";
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
  const result = makeInitialAppState(
    null,
    {
      ...definition,
      migration: {
        source: "",
        compiled: "export default () => ({ count: 99 });",
      },
    },
    "AppVersion_initial",
  );

  // Verify
  expect(result).toEqual({
    success: true,
    data: {
      content: { count: 0 },
      revision: 1,
      schemaId: "AppVersion_initial",
    },
    error: null,
  });
});

it("keeps legacy apps stateless", () => {
  // Exercise
  const result = makeInitialAppState(null, undefined, "AppVersion_initial");

  // Verify
  expect(result).toEqual({ success: true, data: undefined, error: null });
});

it("retains semantic schema validation issues", () => {
  // Exercise
  const result = makeInitialAppState(
    null,
    {
      ...definition,
      schema: { ...definition.schema, rootType: "Missing" },
    },
    "AppVersion_initial",
  );

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

it("identifies invalid initial content by schema and property path", () => {
  // Exercise
  const result = makeInitialAppState(
    "App_existing",
    { ...definition, initialState: { count: "invalid" } },
    "AppVersion_initial",
  );

  // Verify
  expect(result.error).toEqual({
    name: "AppStateContentNotValid",
    details: {
      appId: "App_existing",
      schemaId: "AppVersion_initial",
      issues: [
        expect.objectContaining({
          message: expect.any(String),
          path: [{ key: "count" }],
        }),
      ],
    },
  });
});
