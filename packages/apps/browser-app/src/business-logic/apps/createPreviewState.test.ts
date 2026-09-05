import type { AppStateDefinition } from "@superego/backend";
import { DataType } from "@superego/schema";
import { expect, it } from "vitest";
import createPreviewState from "./createPreviewState.js";

it("keeps preview stores isolated and never overwrites initial state", async () => {
  // Setup SUT
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
  const first = createPreviewState(definition, "AppVersion_first", () => {});
  const second = createPreviewState(definition, "AppVersion_second", () => {});
  // Exercise
  const saved = await first.update(1, { count: 5 });
  const conflict = await first.update(1, { count: 9 });
  // Verify
  expect(saved.data?.content).toEqual({ count: 5 });
  expect(conflict.error).toEqual({
    name: "AppStateError",
    details: { reason: "RevisionConflict" },
  });
  expect((await second.get()).data?.content).toEqual({ count: 0 });
  expect(definition.initialState).toEqual({ count: 0 });
});
