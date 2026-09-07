import { DataType } from "@superego/schema";
import * as v from "valibot";
import { expect, it } from "vitest";
import appStateContent from "./appStateContent.js";

it("validates JSON compatibility before traversing cyclic state content", () => {
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

it("retains content schema paths for JSON-compatible invalid state", () => {
  // Setup SUT
  const schema = appStateContent({
    types: {
      State: {
        dataType: DataType.Struct,
        properties: { count: { dataType: DataType.Number } },
      },
    },
    rootType: "State",
  });

  // Exercise
  const invalid = v.safeParse(schema, { count: "invalid" });
  const valid = v.safeParse(schema, { count: 1 });

  // Verify
  expect(invalid.success).toBe(false);
  expect(invalid.issues?.[0]?.path?.map(({ key }) => key)).toEqual(["count"]);
  expect(valid.success).toBe(true);
});
