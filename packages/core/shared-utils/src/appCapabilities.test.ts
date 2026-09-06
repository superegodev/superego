import { DataType, valibotSchemas } from "@superego/schema";
import * as v from "valibot";
import { describe, expect, it } from "vitest";
import {
  appPermissionsSchema,
  appStateSchema,
  normalizeHttpOrigin,
  isJsonValue,
} from "./appCapabilities.js";

describe("app capabilities", () => {
  it.each([
    ["HTTPS://EXAMPLE.COM:443/", "https://example.com"],
    ["http://127.1:8080", "http://127.0.0.1:8080"],
    ["http://0x7f000001", "http://127.0.0.1"],
    ["http://[0:0:0:0:0:0:0:1]:80", "http://[::1]"],
  ])("normalizes %s", (source, expected) => {
    // Exercise
    const origin = normalizeHttpOrigin(source);
    // Verify
    expect(origin).toBe(expected);
  });
  it.each([
    "file:///tmp",
    "https://*.example.com",
    "https://%2A.example.com",
    "https://%2a.example.com",
    "https://api*.example.com",
    "https://example.com/path",
    "https://example.com?token=secret",
    "https://user:pass@example.com",
    "https://example.com/#fragment",
    "https://example.com;connect-src",
    "https://example.com; connect-src *",
    "https://example.com%3Bconnect-src",
    "https://exam\tple.com",
    "https://example.com\n",
  ])("rejects %s", (origin) => {
    // Exercise
    const result = v.safeParse(appPermissionsSchema(), {
      http: { allowedOrigins: [origin] },
    });
    // Verify
    expect(result.success).toBe(false);
  });
  it("uses restrictive defaults and rejects arbitrary capabilities", () => {
    // Exercise
    const valid = v.parse(appPermissionsSchema(), {});
    const invalid = v.safeParse(appPermissionsSchema(), { scripts: true });
    // Verify
    expect(valid).toEqual({});
    expect(invalid.success).toBe(false);
  });
  it("rejects cyclic and non-JSON state", () => {
    // Setup SUT
    const cyclic: any = {};
    cyclic.self = cyclic;
    // Exercise
    const results = [
      cyclic,
      { value: new Date() },
      { value: undefined },
      { value: Infinity },
    ].map((value) => isJsonValue(value));
    // Verify
    expect(results).toEqual([false, false, false, false]);
  });
});

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
