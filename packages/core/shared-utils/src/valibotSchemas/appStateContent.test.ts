import { DataType } from "@superego/schema";
import * as v from "valibot";
import { expect, it } from "vitest";
import appStateContent from "./appStateContent.js";

it("rejects cyclic state without overflowing the stack", () => {
  // Setup SUT
  const content: Record<string, unknown> = {};
  content["self"] = content;
  const schema = appStateContent({
    types: {
      State: {
        dataType: DataType.Struct,
        properties: { self: { dataType: null, ref: "State" } },
        nullableProperties: ["self"],
      },
    },
    rootType: "State",
  });

  // Exercise
  const result = v.safeParse(schema, content);

  // Verify
  expect(result.success).toBe(false);
  expect(result.issues).toEqual([
    expect.objectContaining({
      message: "Invalid JSON value: not JSON-invariant",
    }),
  ]);
});
