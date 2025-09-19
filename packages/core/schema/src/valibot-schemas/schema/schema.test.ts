import { DataType } from "@superego/schema";
import * as v from "valibot";
import { describe, expect, it } from "vitest";
import schema from "./schema.js";

//////////////////////////////
// Test function definition //
//////////////////////////////

interface TestCase {
  schema: any;
  expectedIssues: {
    kind: "schema" | "validation";
    message: string;
    path?: { key: string | number }[];
  }[];
}
const test = (name: string, testCase: TestCase, only?: boolean) => {
  it(name, { only: only ?? false }, () => {
    // Exercise
    const result = v.safeParse(schema(), testCase.schema);
    // Verify
    expect(result.issues ?? []).toMatchObject(testCase.expectedIssues);
  });
};
test.only = (name: string, testCase: TestCase) => test(name, testCase, true);

///////////
// Tests //
///////////

describe("Invalid schemas", () => {
  describe("Missing properties", () => {
    test('missing "types" at schema root', {
      schema: {
        rootType: "Root",
      },
      expectedIssues: [
        {
          kind: "schema",
          message: 'Invalid key: Expected "types" but received undefined',
          path: [{ key: "types" }],
        },
      ],
    });

    test('missing "rootType" at schema root', {
      schema: {
        types: {},
      },
      expectedIssues: [
        {
          kind: "schema",
          message: 'Invalid key: Expected "rootType" but received undefined',
          path: [{ key: "rootType" }],
        },
      ],
    });

    test('missing "dataType" in type definition or type definition ref', {
      schema: {
        types: {
          Root: {},
        },
        rootType: "Root",
      },
      expectedIssues: [
        {
          kind: "schema",
          message:
            'Invalid type: Expected ("String" | "Enum" | "Number" | "Boolean" | "StringLiteral" | "NumberLiteral" | "BooleanLiteral" | "JsonObject" | "File" | "Struct" | "List" | null) but received undefined',
          path: [{ key: "types" }, { key: "Root" }, { key: "dataType" }],
        },
      ],
    });

    test('missing "members" in Enum type definition', {
      schema: {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {
              enum: {
                dataType: null,
                ref: "Enum",
              },
            },
          },
          Enum: {
            dataType: DataType.Enum,
          },
        },
        rootType: "Root",
      },
      expectedIssues: [
        {
          kind: "schema",
          message: 'Invalid key: Expected "members" but received undefined',
          path: [{ key: "types" }, { key: "Enum" }, { key: "members" }],
        },
      ],
    });

    test('missing "value" in StringLiteral type definition', {
      schema: {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {
              stringLiteral: {
                dataType: null,
                ref: "StringLiteral",
              },
            },
          },
          StringLiteral: {
            dataType: DataType.StringLiteral,
          },
        },
        rootType: "Root",
      },
      expectedIssues: [
        {
          kind: "schema",
          message: 'Invalid key: Expected "value" but received undefined',
          path: [{ key: "types" }, { key: "StringLiteral" }, { key: "value" }],
        },
      ],
    });

    test('missing "value" in NumberLiteral type definition', {
      schema: {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {
              numberLiteral: {
                dataType: null,
                ref: "NumberLiteral",
              },
            },
          },
          NumberLiteral: {
            dataType: DataType.NumberLiteral,
          },
        },
        rootType: "Root",
      },
      expectedIssues: [
        {
          kind: "schema",
          message: 'Invalid key: Expected "value" but received undefined',
          path: [{ key: "types" }, { key: "NumberLiteral" }, { key: "value" }],
        },
      ],
    });

    test('missing "value" in BooleanLiteral type definition', {
      schema: {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {
              booleanLiteral: {
                dataType: null,
                ref: "BooleanLiteral",
              },
            },
          },
          BooleanLiteral: {
            dataType: DataType.BooleanLiteral,
          },
        },
        rootType: "Root",
      },
      expectedIssues: [
        {
          kind: "schema",
          message: 'Invalid key: Expected "value" but received undefined',
          path: [{ key: "types" }, { key: "BooleanLiteral" }, { key: "value" }],
        },
      ],
    });

    test('missing "properties" in Struct type definition', {
      schema: {
        types: {
          Root: {
            dataType: DataType.Struct,
          },
        },
        rootType: "Root",
      },
      expectedIssues: [
        {
          kind: "schema",
          message: 'Invalid key: Expected "properties" but received undefined',
          path: [{ key: "types" }, { key: "Root" }, { key: "properties" }],
        },
      ],
    });

    test('missing "items" in List type definition', {
      schema: {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {
              list: {
                dataType: null,
                ref: "List",
              },
            },
          },
          List: {
            dataType: DataType.List,
          },
        },
        rootType: "Root",
      },
      expectedIssues: [
        {
          kind: "schema",
          message: 'Invalid key: Expected "items" but received undefined',
          path: [{ key: "types" }, { key: "List" }, { key: "items" }],
        },
      ],
    });

    test('missing "ref" in type definition ref', {
      schema: {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {
              list: {
                dataType: null,
              },
            },
          },
        },
        rootType: "Root",
      },
      expectedIssues: [
        {
          kind: "schema",
          message: 'Invalid key: Expected "ref" but received undefined',
          path: [
            { key: "types" },
            { key: "Root" },
            { key: "properties" },
            { key: "list" },
            { key: "ref" },
          ],
        },
      ],
    });
  });

  describe("Extraneous properties", () => {
    test("extraneous property at schema root", {
      schema: {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {},
          },
        },
        rootType: "Root",
        extraneousProperty: "extraneousProperty",
      },
      expectedIssues: [
        {
          kind: "schema",
          message:
            'Invalid key: Expected never but received "extraneousProperty"',
          path: [{ key: "extraneousProperty" }],
        },
      ],
    });

    test("extraneous property in type definition", {
      schema: {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {},
            extraneousProperty: "extraneousProperty",
          },
        },
        rootType: "Root",
      },
      expectedIssues: [
        {
          kind: "schema",
          message:
            'Invalid key: Expected never but received "extraneousProperty"',
          path: [
            { key: "types" },
            { key: "Root" },
            { key: "extraneousProperty" },
          ],
        },
      ],
    });
  });

  describe("Invalid property types", () => {
    test("schema not an object", {
      schema: "string",
      expectedIssues: [
        {
          kind: "schema",
          message: 'Invalid type: Expected Object but received "string"',
        },
      ],
    });

    test("invalid property type at schema root", {
      schema: {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {},
          },
        },
        rootType: { name: "Root" },
      },
      expectedIssues: [
        {
          kind: "schema",
          message: "Invalid type: Expected string but received Object",
          path: [{ key: "rootType" }],
        },
      ],
    });

    test("invalid property type in type definition", {
      schema: {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: "string",
          },
        },
        rootType: "Root",
      },
      expectedIssues: [
        {
          kind: "schema",
          message: 'Invalid type: Expected Object but received "string"',
          path: [{ key: "types" }, { key: "Root" }, { key: "properties" }],
        },
      ],
    });

    test("invalid format in string type definition", {
      schema: {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {
              string: {
                dataType: null,
                ref: "String",
              },
            },
          },
          String: {
            dataType: DataType.String,
            format: true,
          },
        },
        rootType: "Root",
      },
      expectedIssues: [
        {
          kind: "schema",
          message: "Invalid type: Expected string but received true",
          path: [{ key: "types" }, { key: "String" }, { key: "format" }],
        },
      ],
    });

    test("invalid member value in enum type definition", {
      schema: {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {
              enum: {
                dataType: null,
                ref: "Enum",
              },
            },
          },
          Enum: {
            dataType: DataType.Enum,
            members: {
              A: true,
            },
          },
        },
        rootType: "Root",
      },
      expectedIssues: [
        {
          kind: "schema",
          message: "Invalid type: Expected Object but received true",
          path: [
            { key: "types" },
            { key: "Enum" },
            { key: "members" },
            { key: "A" },
          ],
        },
      ],
    });

    test("invalid accept in file type definition", {
      schema: {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {
              file: {
                dataType: null,
                ref: "File",
              },
            },
          },
          File: {
            dataType: DataType.File,
            accept: {
              text: "*",
            },
          },
        },
        rootType: "Root",
      },
      expectedIssues: [
        {
          kind: "validation",
          message: 'Invalid mime type matcher: Received "text"',
          path: [
            { key: "types" },
            { key: "File" },
            { key: "accept" },
            { key: "text" },
          ],
        },
      ],
    });

    describe("invalid nullableProperties in struct type definition", () => {
      test("case: invalid nullableProperty type", {
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {},
              nullableProperties: [true],
            },
          },
          rootType: "Root",
        },
        expectedIssues: [
          {
            kind: "schema",
            message: "Invalid type: Expected string but received true",
            path: [
              { key: "types" },
              { key: "Root" },
              { key: "nullableProperties" },
              { key: 0 },
            ],
          },
        ],
      });

      test("case: non-existing nullableProperty", {
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {},
              nullableProperties: ["non-existing"],
            },
          },
          rootType: "Root",
        },
        expectedIssues: [
          {
            kind: "validation",
            message: 'Property "non-existing" does not exist in struct',
            path: [
              { key: "types" },
              { key: "Root" },
              { key: "nullableProperties" },
              { key: 0 },
            ],
          },
        ],
      });

      test("case: duplicate nullableProperty", {
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                string: { dataType: DataType.String },
              },
              nullableProperties: ["string", "string"],
            },
          },
          rootType: "Root",
        },
        expectedIssues: [
          {
            kind: "validation",
            message: "Must not contain duplicates",
            path: [
              { key: "types" },
              { key: "Root" },
              { key: "nullableProperties" },
            ],
          },
        ],
      });
    });

    describe("invalid propertiesOrder in struct type definition", () => {
      test("case: non-existing property", {
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {},
              propertiesOrder: ["non-existing"],
            },
          },
          rootType: "Root",
        },
        expectedIssues: [
          {
            kind: "validation",
            message: "Must contain all property names and nothing else",
            path: [
              { key: "types" },
              { key: "Root" },
              { key: "propertiesOrder" },
            ],
          },
        ],
      });

      test("case: missing property", {
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                string: { dataType: DataType.String },
              },
              propertiesOrder: [],
            },
          },
          rootType: "Root",
        },
        expectedIssues: [
          {
            kind: "validation",
            message: "Must contain all property names and nothing else",
            path: [
              { key: "types" },
              { key: "Root" },
              { key: "propertiesOrder" },
            ],
          },
        ],
      });

      test("case: duplicate property", {
        schema: {
          types: {
            Root: {
              dataType: DataType.Struct,
              properties: {
                string: { dataType: DataType.String },
              },
              propertiesOrder: ["string", "string"],
            },
          },
          rootType: "Root",
        },
        expectedIssues: [
          {
            kind: "validation",
            message: "Must not contain duplicates",
            path: [
              { key: "types" },
              { key: "Root" },
              { key: "propertiesOrder" },
            ],
          },
        ],
      });
    });
  });

  describe("Invalid type names", () => {
    test("name containing invalid characters", {
      schema: {
        types: {
          "Root@": { dataType: DataType.Struct, properties: {} },
        },
        rootType: "Root@",
      },
      expectedIssues: [
        {
          kind: "validation",
          message:
            'Invalid identifier: Should match /^[a-zA-Z_$][a-zA-Z0-9_$]{0,127}$/ but received "Root@"',
          path: [{ key: "types" }, { key: "Root@" }],
        },
      ],
    });

    test("name starting with a number", {
      schema: {
        types: {
          "0Root": { dataType: DataType.Struct, properties: {} },
        },
        rootType: "0Root",
      },
      expectedIssues: [
        {
          kind: "validation",
          message:
            'Invalid identifier: Should match /^[a-zA-Z_$][a-zA-Z0-9_$]{0,127}$/ but received "0Root"',
          path: [{ key: "types" }, { key: "0Root" }],
        },
      ],
    });
  });

  describe("Types not found", () => {
    test("root type ref", {
      schema: {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {},
          },
        },
        rootType: "DifferentRoot",
      },
      expectedIssues: [
        {
          kind: "validation",
          message: "Type not found",
          path: [{ key: "rootType" }],
        },
        {
          kind: "validation",
          message: "Unused type",
          path: [{ key: "types" }, { key: "Root" }],
        },
      ],
    });

    test("ref in type definition", {
      schema: {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {
              leaf: {
                dataType: null,
                ref: "LeafTYPO",
              },
            },
          },
          Leaf: {
            dataType: DataType.String,
          },
        },
        rootType: "Root",
      },
      expectedIssues: [
        {
          kind: "validation",
          message: "Type not found",
          path: [
            { key: "types" },
            { key: "Root" },
            { key: "properties" },
            { key: "leaf" },
            { key: "ref" },
          ],
        },
        {
          kind: "validation",
          message: "Unused type",
          path: [{ key: "types" }, { key: "Leaf" }],
        },
      ],
    });
  });

  describe("Unused types", () => {
    test("single unused type", {
      schema: {
        types: {
          Root: { dataType: DataType.Struct, properties: {} },
          A: { dataType: DataType.String },
        },
        rootType: "Root",
      },
      expectedIssues: [
        {
          kind: "validation",
          message: "Unused type",
          path: [{ key: "types" }, { key: "A" }],
        },
      ],
    });

    test("two unused types, but one is referenced by the other", {
      schema: {
        types: {
          Root: { dataType: DataType.Struct, properties: {} },
          A: { dataType: DataType.String },
          B: {
            dataType: DataType.Struct,
            properties: {
              a: { dataType: null, ref: "A" },
            },
          },
        },
        rootType: "Root",
      },
      expectedIssues: [
        {
          kind: "validation",
          message: "Unused type",
          path: [{ key: "types" }, { key: "B" }],
        },
      ],
    });
  });

  test("Struct nullable property referencing a non-existing property", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {},
          nullableProperties: ["nonExisting"],
        },
      },
      rootType: "Root",
    },
    expectedIssues: [
      {
        kind: "validation",
        message: 'Property "nonExisting" does not exist in struct',
        path: [
          { key: "types" },
          { key: "Root" },
          { key: "nullableProperties" },
          { key: 0 },
        ],
      },
    ],
  });

  test("Top-level type is a ref (not allowed)", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            a: {
              dataType: null,
              ref: "A",
            },
          },
        },
        A: {
          dataType: null,
          ref: "B",
        },
        B: {
          dataType: DataType.String,
        },
      },
      rootType: "Root",
    },
    expectedIssues: [
      {
        kind: "validation",
        message: 'Top-level type "A" cannot be a type definition ref',
        path: [{ key: "types" }, { key: "A" }],
      },
    ],
  });

  test("Root type is not a Struct", {
    schema: {
      types: {
        Root: { dataType: DataType.String },
      },
      rootType: "Root",
    },
    expectedIssues: [
      {
        kind: "validation",
        message: "Root type must be a Struct",
        path: [{ key: "rootType" }],
      },
    ],
  });
});

describe("Valid schemas", () => {
  test("file type definition with complex but valid accept", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            file: {
              dataType: null,
              ref: "File",
            },
          },
        },
        File: {
          dataType: DataType.File,
          accept: {
            "*/*": "*",
            "image/*": [".png", ".svg"],
            "application/vnd.ms-excel": [".xls", ".xlsx"],
            "application/tar+gzip": [".tar.gz"],
          },
        },
      },
      rootType: "Root",
    },
    expectedIssues: [],
  });

  test("realistic scenario", {
    schema: {
      types: {
        Food: {
          dataType: DataType.Struct,
          properties: {
            name: {
              dataType: DataType.String,
            },
            servingSize: {
              dataType: null,
              ref: "MassQuantity",
            },
            nutritionFacts: {
              dataType: DataType.Struct,
              properties: {
                calories: {
                  dataType: null,
                  ref: "EnergyQuantity",
                },
                fat: {
                  dataType: null,
                  ref: "MassQuantity",
                },
                carbs: {
                  dataType: null,
                  ref: "MassQuantity",
                },
                protein: {
                  dataType: null,
                  ref: "MassQuantity",
                },
              },
            },
          },
        },
        MassQuantity: {
          dataType: DataType.Struct,
          properties: {
            unit: {
              dataType: DataType.StringLiteral,
              value: "g",
            },
            amount: {
              dataType: DataType.Number,
            },
          },
        },
        EnergyQuantity: {
          dataType: DataType.Struct,
          properties: {
            unit: {
              dataType: DataType.StringLiteral,
              value: "kcal",
            },
            amount: {
              dataType: DataType.Number,
            },
          },
        },
      },
      rootType: "Food",
    },
    expectedIssues: [],
  });
});
