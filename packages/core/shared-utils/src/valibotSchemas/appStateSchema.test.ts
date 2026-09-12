import { DataType, valibotSchemas } from "@superego/schema";
import * as v from "valibot";
import { expect, it } from "vitest";
import appStateSchema from "./appStateSchema.js";

it.each([DataType.File, DataType.DocumentRef])(
  "rejects %s in nested, referenced state types",
  (dataType) => {
    // Exercise
    const schema = {
      types: {
        State: {
          dataType: DataType.Struct,
          properties: {
            items: {
              dataType: DataType.List,
              items: { dataType: null, ref: "Nested" },
            },
          },
        },
        Nested: {
          dataType: DataType.Struct,
          properties: { value: { dataType } },
        },
      },
      rootType: "State",
    };
    const result = v.safeParse(appStateSchema(), schema);
    // Verify
    expect(v.safeParse(valibotSchemas.schema(), schema).success).toBe(true);
    expect(result.success).toBe(false);
  },
);
