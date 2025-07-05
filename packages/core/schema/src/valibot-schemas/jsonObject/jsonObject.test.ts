import { fc, it as fit } from "@fast-check/vitest";
import * as v from "valibot";
import { describe, expect, it } from "vitest";
import DataType from "../../DataType.js";
import jsonObject from "./jsonObject.js";

//////////////////////////////
// Test function definition //
//////////////////////////////

interface TestCase {
  jsonObject: any;
  expectedIssues: {
    kind: "schema" | "validation";
    message: string;
    path?: { key: string | number }[];
  }[];
}
const test = (name: string, testCase: TestCase, only?: boolean) => {
  it(name, { only: only ?? false }, () => {
    // Exercise
    const result = v.safeParse(jsonObject(), testCase.jsonObject);
    // Verify
    expect(result.issues ?? []).toMatchObject(testCase.expectedIssues);
  });
};
test.only = (name: string, testCase: TestCase) => test(name, testCase, true);

///////////
// Tests //
///////////

describe("Invalid JsonObjects", () => {
  test("object without branding", {
    jsonObject: {},
    expectedIssues: [
      {
        kind: "schema",
        message: 'Invalid key: Expected "__dataType" but received undefined',
      },
    ],
  });

  test("object with invalid branding", {
    jsonObject: { __dataType: DataType.Struct },
    expectedIssues: [
      {
        kind: "schema",
        message: 'Invalid type: Expected "JsonObject" but received "Struct"',
      },
    ],
  });

  test("non-JSON-serializable object", {
    jsonObject: (() => {
      const obj: any = {};
      obj.obj = obj;
      return obj;
    })(),
    expectedIssues: [
      {
        kind: "validation",
        message: "Invalid JsonObject: Does not serialize to a JSON object",
      },
    ],
  });

  test("value not serializing to a JSON object", {
    jsonObject: [],
    expectedIssues: [
      {
        kind: "validation",
        message: "Invalid JsonObject: Does not serialize to a JSON object",
      },
    ],
  });

  describe("non-JSON-invariant objects", () => {
    test("with Date", {
      jsonObject: { __dataType: DataType.JsonObject, date: new Date() },
      expectedIssues: [
        {
          kind: "validation",
          message: "Invalid JsonObject: not JSON-invariant",
        },
      ],
    });

    test("with Function", {
      jsonObject: { __dataType: DataType.JsonObject, func: () => {} },
      expectedIssues: [
        {
          kind: "validation",
          message: "Invalid JsonObject: not JSON-invariant",
        },
      ],
    });

    test("with undefined", {
      jsonObject: { __dataType: DataType.JsonObject, undef: undefined },
      expectedIssues: [
        {
          kind: "validation",
          message: "Invalid JsonObject: not JSON-invariant",
        },
      ],
    });

    test("with Symbol", {
      jsonObject: { __dataType: DataType.JsonObject, symbol: Symbol("symbol") },
      expectedIssues: [
        {
          kind: "validation",
          message: "Invalid JsonObject: not JSON-invariant",
        },
      ],
    });

    test("with NaN", {
      jsonObject: { __dataType: DataType.JsonObject, nan: Number.NaN },
      expectedIssues: [
        {
          kind: "validation",
          message: "Invalid JsonObject: not JSON-invariant",
        },
      ],
    });

    test("with Infinity", {
      jsonObject: {
        __dataType: DataType.JsonObject,
        infinity: Number.POSITIVE_INFINITY,
      },
      expectedIssues: [
        {
          kind: "validation",
          message: "Invalid JsonObject: not JSON-invariant",
        },
      ],
    });
  });
});

describe("Valid JsonObjects", () => {
  fit.prop([fc.object()])("arbitrary JsonObject", (arbitraryObject) => {
    const arbitraryJsonObject = JSON.parse(JSON.stringify(arbitraryObject));
    expect(
      v.is(jsonObject(), {
        ...arbitraryJsonObject,
        __dataType: DataType.JsonObject,
      }),
    ).toEqual(true);
  });

  test("empty JsonObject", {
    jsonObject: { __dataType: DataType.JsonObject },
    expectedIssues: [],
  });
});
