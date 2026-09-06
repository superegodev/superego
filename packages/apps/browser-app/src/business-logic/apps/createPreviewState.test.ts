import type { AppStateDefinition } from "@superego/backend";
import { DataType } from "@superego/schema";
import { emptyAppStateDefinition } from "@superego/shared-utils";
import { expect, it } from "vitest";
import createPreviewState from "./createPreviewState.js";

it("keeps preview stores isolated and never overwrites initial state", async () => {
  // Setup SUT
  const definition: AppStateDefinition = {
    migration: null,
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
  const first = createPreviewState("App_first", definition);
  const second = createPreviewState("App_second", definition);
  // Exercise
  const saved = await first.update(1, { count: 5 });
  const conflict = await first.update(1, { count: 9 });
  // Verify
  expect(saved.data?.content).toEqual({ count: 5 });
  expect(conflict.error).toEqual({
    name: "AppStateRevisionNotMatching",
    details: { appId: "App_first", latestRevision: 2, suppliedRevision: 1 },
  });
  expect((await second.get()).data?.content).toEqual({ count: 0 });
  expect(definition.initialState).toEqual({ count: 0 });
});

it("supports empty state in previews", async () => {
  // Setup SUT
  const preview = createPreviewState("App_preview", emptyAppStateDefinition);

  // Exercise
  const read = await preview.get();
  const update = await preview.update(1, {});

  // Verify
  expect(read.data).toEqual({ content: {}, revision: 1 });
  expect(update.data).toEqual({ content: {}, revision: 2 });
});

it("preserves schema validation failures on preview reads and writes", async () => {
  // Setup SUT
  const preview = createPreviewState("App_preview", {
    migration: null,
    schema: {
      types: {
        State: {
          dataType: DataType.Struct,
          properties: { file: { dataType: DataType.File } },
        },
      },
      rootType: "State",
    },
    initialState: {},
  });

  // Exercise
  const read = await preview.get();
  const update = await preview.update(1, {});

  // Verify
  expect(read.error).toEqual({
    name: "AppStateSchemaNotValid",
    details: {
      appId: "App_preview",
      issues: [
        expect.objectContaining({
          message: "App state cannot contain File or DocumentRef types.",
        }),
      ],
    },
  });
  expect(update.error).toEqual(read.error);
});

it("distinguishes invalid initial content and preserves its validation path", async () => {
  // Setup SUT
  const preview = createPreviewState("App_preview", {
    migration: null,
    schema: {
      types: {
        State: {
          dataType: DataType.Struct,
          properties: { count: { dataType: DataType.Number } },
        },
      },
      rootType: "State",
    },
    initialState: { count: "invalid" },
  });

  // Exercise
  const read = await preview.get();
  const update = await preview.update(1, { count: 1 });

  // Verify
  expect(read.error).toEqual({
    name: "AppStateContentNotValid",
    details: {
      appId: "App_preview",
      issues: [
        expect.objectContaining({
          message: expect.any(String),
          path: [{ key: "count" }],
        }),
      ],
    },
  });
  expect(update.error).toEqual(read.error);
});
