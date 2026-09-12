import * as v from "valibot";
import { expect, it } from "vitest";
import { valibotSchemas } from "../../index.js";

it("validates JSON values without requiring JsonObject branding", () => {
  // Exercise
  const valid = v.safeParse(valibotSchemas.jsonValue(), { count: 1 });
  const invalid = v.safeParse(valibotSchemas.jsonValue(), { count: Infinity });
  // Verify
  expect(valid.success).toBe(true);
  expect(invalid.issues).toEqual([
    expect.objectContaining({
      message: "Invalid JSON value: not JSON-invariant",
    }),
  ]);
});
