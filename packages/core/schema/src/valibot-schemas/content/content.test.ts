import * as v from "valibot";
import { describe, expect, it } from "vitest";
import DataType from "../../DataType.js";
import FormatId from "../../formats/FormatId.js";
import formats from "../../formats/formats.js";
import type Schema from "../../Schema.js";
import content from "./content.js";

//////////////////////////////
// Test function definition //
//////////////////////////////

interface TestCase {
  schema: Schema;
  content: any;
  expectedIssues: {
    kind: "schema" | "validation";
    message: string;
    path?: { key: string | number }[];
  }[];
}
const test = (name: string, testCase: TestCase, only?: boolean) => {
  it(name, { only: only ?? false }, () => {
    // Exercise
    const result = v.safeParse(content(testCase.schema), testCase.content);
    // Verify
    expect(result.issues ?? []).toMatchObject(testCase.expectedIssues);
  });
};
test.only = (name: string, testCase: TestCase) => test(name, testCase, true);

///////////
// Tests //
///////////

const PlainDate = formats.find(({ id }) => id === FormatId.String.PlainDate)!;
const Integer = formats.find(({ id }) => id === FormatId.Number.Integer)!;

describe("String type definition without format", () => {
  test("empty string is valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.String,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: "" },
    expectedIssues: [],
  });

  test("non-empty string is valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.String,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: "non-empty" },
    expectedIssues: [],
  });

  test("null is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.String,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: null },
    expectedIssues: [
      {
        kind: "schema",
        message: "Invalid type: Expected string but received null",
        path: [{ key: "value" }],
      },
    ],
  });

  test("non-string value is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.String,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: 0 },
    expectedIssues: [
      {
        kind: "schema",
        message: "Invalid type: Expected string but received 0",
        path: [{ key: "value" }],
      },
    ],
  });
});

describe("String type definition with format", () => {
  test("known format -> well-formatted string is valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.String,
              format: PlainDate.id,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: "1970-01-01" },
    expectedIssues: [],
  });

  test("unknown format -> any string is valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.String,
              format: "unknown",
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: "any" },
    expectedIssues: [],
  });

  test("known format -> malformed string is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.String,
              format: PlainDate.id,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: "malformed" },
    expectedIssues: [
      {
        kind: "validation",
        message:
          'Invalid plain date: Received "malformed". Expected format: YYYY-MM-DD (no time, no offset; Gregorian-valid).',
        path: [{ key: "value" }],
      },
    ],
  });
});

describe("Enum type definition", () => {
  test("enum value is valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: null,
              ref: "Enum",
            },
          },
        },
        Enum: {
          dataType: DataType.Enum,
          members: {
            A: { value: "A" },
            B: { value: "B" },
            C: { value: "C" },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: "A" },
    expectedIssues: [],
  });

  test("null is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: null,
              ref: "Enum",
            },
          },
        },
        Enum: {
          dataType: DataType.Enum,
          members: {
            A: { value: "A" },
            B: { value: "B" },
            C: { value: "C" },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: null },
    expectedIssues: [
      {
        kind: "schema",
        message: 'Invalid type: Expected ("A" | "B" | "C") but received null',
        path: [{ key: "value" }],
      },
    ],
  });

  test("non-enum value is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: null,
              ref: "Enum",
            },
          },
        },
        Enum: {
          dataType: DataType.Enum,
          members: {
            A: { value: "A" },
            B: { value: "B" },
            C: { value: "C" },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: "D" },
    expectedIssues: [
      {
        kind: "schema",
        message: 'Invalid type: Expected ("A" | "B" | "C") but received "D"',
        path: [{ key: "value" }],
      },
    ],
  });
});

describe("Number type definition without format", () => {
  test("any number is valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.Number,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: 0 },
    expectedIssues: [],
  });

  test("null is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.Number,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: null },
    expectedIssues: [
      {
        kind: "schema",
        message: "Invalid type: Expected number but received null",
        path: [{ key: "value" }],
      },
    ],
  });

  test("non-number value is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.Number,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: "0" },
    expectedIssues: [
      {
        kind: "schema",
        message: 'Invalid type: Expected number but received "0"',
        path: [{ key: "value" }],
      },
    ],
  });
});

describe("Number type definition with format", () => {
  test("known format -> well-formatted number is valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.Number,
              format: Integer.id,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: 0 },
    expectedIssues: [],
  });

  test("unknown format -> any number is valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.Number,
              format: "unknown",
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: Math.PI },
    expectedIssues: [],
  });

  test("known format -> malformed number is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.Number,
              format: Integer.id,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: Math.PI },
    expectedIssues: [
      {
        kind: "validation",
        message: "Invalid integer: Received 3.141592653589793",
        path: [{ key: "value" }],
      },
    ],
  });
});

describe("Boolean type definition", () => {
  test("any boolean is valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.Boolean,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: true },
    expectedIssues: [],
  });

  test("null is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.Boolean,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: null },
    expectedIssues: [
      {
        kind: "schema",
        message: "Invalid type: Expected boolean but received null",
        path: [{ key: "value" }],
      },
    ],
  });

  test("non-boolean value is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.Boolean,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: "A" },
    expectedIssues: [
      {
        kind: "schema",
        message: 'Invalid type: Expected boolean but received "A"',
        path: [{ key: "value" }],
      },
    ],
  });
});

describe("String literal type definition", () => {
  test("the literal string is valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.StringLiteral,
              value: "A",
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: "A" },
    expectedIssues: [],
  });

  test("null is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.StringLiteral,
              value: "A",
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: null },
    expectedIssues: [
      {
        kind: "schema",
        message: 'Invalid type: Expected "A" but received null',
        path: [{ key: "value" }],
      },
    ],
  });

  test("any string other than the literal string is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.StringLiteral,
              value: "A",
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: "B" },
    expectedIssues: [
      {
        kind: "schema",
        message: 'Invalid type: Expected "A" but received "B"',
        path: [{ key: "value" }],
      },
    ],
  });
});

describe("Number literal type definition", () => {
  test("the literal number is valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.NumberLiteral,
              value: 0,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: 0 },
    expectedIssues: [],
  });

  test("null is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.NumberLiteral,
              value: 0,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: null },
    expectedIssues: [
      {
        kind: "schema",
        message: "Invalid type: Expected 0 but received null",
        path: [{ key: "value" }],
      },
    ],
  });

  test("any number other than the literal number is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.NumberLiteral,
              value: 0,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: 1 },
    expectedIssues: [
      {
        kind: "schema",
        message: "Invalid type: Expected 0 but received 1",
        path: [{ key: "value" }],
      },
    ],
  });
});

describe("Boolean literal type definition", () => {
  test("the literal boolean is valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.BooleanLiteral,
              value: true,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: true },
    expectedIssues: [],
  });

  test("null is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.BooleanLiteral,
              value: true,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: null },
    expectedIssues: [
      {
        kind: "schema",
        message: "Invalid type: Expected true but received null",
        path: [{ key: "value" }],
      },
    ],
  });

  test("the opposite boolean is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.BooleanLiteral,
              value: true,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: false },
    expectedIssues: [
      {
        kind: "schema",
        message: "Invalid type: Expected true but received false",
        path: [{ key: "value" }],
      },
    ],
  });
});

describe("JsonObject type definition without format", () => {
  test(
    "anything serializing to a json object with __dataType=JsonObject is valid",
    {
      schema: {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {
              value: {
                dataType: DataType.JsonObject,
              },
            },
          },
        },
        rootType: "Root",
      },
      content: {
        value: { __dataType: DataType.JsonObject },
      },
      expectedIssues: [],
    },
  );

  test("null is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.JsonObject,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: null },
    expectedIssues: [
      {
        kind: "schema",
        message: "Invalid type: Expected !null but received null",
        path: [{ key: "value" }],
      },
    ],
  });

  test("something serializing to a json array is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.JsonObject,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: {
      value: [],
    },
    expectedIssues: [
      {
        kind: "validation",
        message: "Invalid JsonObject: Does not serialize to a JSON object",
        path: [{ key: "value" }],
      },
    ],
  });

  test("something not json-serializable is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.JsonObject,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: {
      value: (() => {
        const circularStructure: any = {};
        circularStructure.self = circularStructure;
        return circularStructure;
      })(),
    },
    expectedIssues: [
      {
        kind: "validation",
        message: "Invalid JsonObject: Does not serialize to a JSON object",
        path: [{ key: "value" }],
      },
    ],
  });
});

describe("JsonObject type definition with format", () => {
  test(
    "with unknown format -> anything serializing to a json object with __dataType=JsonObject is valid",
    {
      schema: {
        types: {
          Root: {
            dataType: DataType.Struct,
            properties: {
              value: {
                dataType: DataType.JsonObject,
                format: "unknown",
              },
            },
          },
        },
        rootType: "Root",
      },
      content: {
        value: { __dataType: DataType.JsonObject },
      },
      expectedIssues: [],
    },
  );
});

describe("File type definition without accept", () => {
  test("any FileRef is valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.File,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: {
      value: {
        id: "file_0",
        name: "name",
        mimeType: "text/plain",
      },
    },
    expectedIssues: [],
  });

  test("any ProtoFile is valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.File,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: {
      value: {
        name: "name",
        mimeType: "text/plain",
        content: new TextEncoder().encode("content"),
      },
    },
    expectedIssues: [],
  });

  test("null is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.File,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: null },
    expectedIssues: [
      {
        kind: "schema",
        message: "Invalid type: Expected Object but received null",
        path: [{ key: "value" }],
      },
    ],
  });

  test("a non-FileRef or non-ProtoFile is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.File,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: {
      value: {
        name: "name",
        mimeType: "text/plain",
      },
    },
    expectedIssues: [
      {
        kind: "schema",
        message: "Invalid file: neither a FileRef nor a ProtoFile",
        path: [{ key: "value" }],
      },
    ],
  });
});

describe("File type definition with accept", () => {
  test("any FileRef which satisfies the accept is valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.File,
              accept: {
                "text/plain": [".txt"],
              },
            },
          },
        },
      },
      rootType: "Root",
    },
    content: {
      value: {
        id: "file_0",
        name: "name.txt",
        mimeType: "text/plain",
      },
    },
    expectedIssues: [],
  });

  test("a FileRef which does NOT satisfy the accept is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.File,
              accept: {
                "text/html": [".html", ".htm"],
              },
            },
          },
        },
      },
      rootType: "Root",
    },
    content: {
      value: {
        id: "file_0",
        name: "name.txt",
        mimeType: "text/plain",
      },
    },
    expectedIssues: [
      {
        kind: "validation",
        message: 'Invalid file: Does not satisfy "accept" constraint',
        path: [{ key: "value" }],
      },
    ],
  });
});

describe("Struct type definition", () => {
  test("struct with all valid properties is valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.Struct,
              properties: {
                a: {
                  dataType: DataType.String,
                },
              },
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: { a: "a" } },
    expectedIssues: [],
  });

  test("struct with null nullable properties is valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.Struct,
              properties: {
                a: {
                  dataType: DataType.String,
                },
              },
              nullableProperties: ["a"],
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: { a: null } },
    expectedIssues: [],
  });

  test("null is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.Struct,
              properties: {
                a: {
                  dataType: DataType.String,
                },
              },
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: null },
    expectedIssues: [
      {
        kind: "schema",
        message: "Invalid type: Expected Object but received null",
        path: [{ key: "value" }],
      },
    ],
  });

  test("struct with missing properties is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.Struct,
              properties: {
                a: {
                  dataType: DataType.String,
                },
              },
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: {} },
    expectedIssues: [
      {
        kind: "schema",
        message: 'Invalid key: Expected "a" but received undefined',
        path: [{ key: "value" }, { key: "a" }],
      },
    ],
  });

  test("struct with extraneous properties is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.Struct,
              properties: {
                a: {
                  dataType: DataType.String,
                },
              },
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: { a: "a", b: "b" } },
    expectedIssues: [
      {
        kind: "schema",
        message: 'Invalid key: Expected never but received "b"',
        path: [{ key: "value" }, { key: "b" }],
      },
    ],
  });

  test("struct with invalid properties is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.Struct,
              properties: {
                a: {
                  dataType: DataType.String,
                },
              },
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: { a: 0 } },
    expectedIssues: [
      {
        kind: "schema",
        message: "Invalid type: Expected string but received 0",
        path: [{ key: "value" }, { key: "a" }],
      },
    ],
  });

  test("struct with null non-nullable properties is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.Struct,
              properties: {
                a: {
                  dataType: DataType.String,
                },
              },
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: { a: null } },
    expectedIssues: [
      {
        kind: "schema",
        message: "Invalid type: Expected string but received null",
        path: [{ key: "value" }, { key: "a" }],
      },
    ],
  });
});

describe("List type definition", () => {
  test("non-empty list is valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.List,
              items: { dataType: DataType.String },
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: ["a"] },
    expectedIssues: [],
  });

  test("empty list is valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.List,
              items: { dataType: DataType.String },
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: [] },
    expectedIssues: [],
  });

  test("null is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.List,
              items: { dataType: DataType.String },
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: null },
    expectedIssues: [
      {
        kind: "schema",
        message: "Invalid type: Expected Array but received null",
        path: [{ key: "value" }],
      },
    ],
  });

  test("non-empty list of mismatching type is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.List,
              items: { dataType: DataType.String },
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: ["a", 0, null] },
    expectedIssues: [
      {
        kind: "schema",
        message: "Invalid type: Expected string but received 0",
        path: [{ key: "value" }, { key: 1 }],
      },
      {
        kind: "schema",
        message: "Invalid type: Expected string but received null",
        path: [{ key: "value" }, { key: 2 }],
      },
    ],
  });
});

describe("DocumentRef type definition", () => {
  test("valid DocumentRef is valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.DocumentRef,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: {
      value: { collectionId: "collectionId", documentId: "documentId" },
    },
    expectedIssues: [],
  });

  test("null is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.DocumentRef,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: null },
    expectedIssues: [
      {
        kind: "schema",
        message: "Invalid type: Expected Object but received null",
        path: [{ key: "value" }],
      },
    ],
  });

  test("missing documentId is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.DocumentRef,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: { collectionId: "collectionId" } },
    expectedIssues: [
      {
        kind: "schema",
        message: 'Invalid key: Expected "documentId" but received undefined',
        path: [{ key: "value" }, { key: "documentId" }],
      },
    ],
  });

  test("missing collectionId is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.DocumentRef,
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: { documentId: "documentId" } },
    expectedIssues: [
      {
        kind: "schema",
        message: 'Invalid key: Expected "collectionId" but received undefined',
        path: [{ key: "value" }, { key: "collectionId" }],
      },
    ],
  });
});

describe("DocumentRef type definition with collectionId constraint", () => {
  test("matching collectionId is valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.DocumentRef,
              collectionId: "collectionId",
            },
          },
        },
      },
      rootType: "Root",
    },
    content: {
      value: { collectionId: "collectionId", documentId: "documentId" },
    },
    expectedIssues: [],
  });

  test("non-matching collectionId is NOT valid", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.DocumentRef,
              collectionId: "collectionId",
            },
          },
        },
      },
      rootType: "Root",
    },
    content: {
      value: { collectionId: "otherCollectionId", documentId: "documentId" },
    },
    expectedIssues: [
      {
        kind: "validation",
        message: 'Invalid DocumentRef: collectionId must be "collectionId"',
        path: [{ key: "value" }],
      },
    ],
  });
});

describe("Type definition ref", () => {
  test("valid value according to ref is valid", {
    schema: {
      types: {
        Ref: { dataType: DataType.String },
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: { dataType: null, ref: "Ref" },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: "a" },
    expectedIssues: [],
  });

  test("invalid value according to ref is NOT valid", {
    schema: {
      types: {
        Ref: { dataType: DataType.String },
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: { dataType: null, ref: "Ref" },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: 0 },
    expectedIssues: [
      {
        kind: "schema",
        message: "Invalid type: Expected string but received 0",
        path: [{ key: "value" }],
      },
    ],
  });
});

describe("Error paths", () => {
  test("errors in deeply-nested structs have the correct path", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.Struct,
              properties: {
                l0: {
                  dataType: DataType.Struct,
                  properties: {
                    l1: {
                      dataType: DataType.Struct,
                      properties: {
                        l2: {
                          dataType: DataType.Struct,
                          properties: {
                            a: {
                              dataType: DataType.String,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: { l0: { l1: { l2: {} } } } },
    expectedIssues: [
      {
        kind: "schema",
        message: 'Invalid key: Expected "a" but received undefined',
        path: [
          { key: "value" },
          { key: "l0" },
          { key: "l1" },
          { key: "l2" },
          { key: "a" },
        ],
      },
    ],
  });

  test("errors in deeply-nested lists have the correct path", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            value: {
              dataType: DataType.List,
              items: {
                dataType: DataType.List,
                items: {
                  dataType: DataType.List,
                  items: {
                    dataType: DataType.String,
                  },
                },
              },
            },
          },
        },
      },
      rootType: "Root",
    },
    content: { value: [[], [[], [0]]] },
    expectedIssues: [
      {
        kind: "schema",
        message: "Invalid type: Expected string but received 0",
        path: [{ key: "value" }, { key: 1 }, { key: 1 }, { key: 0 }],
      },
    ],
  });
});

describe("Realistic scenarios", () => {
  test("foods with nutrition facts", {
    schema: {
      types: {
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
      },
      rootType: "Food",
    },
    content: {
      name: "Blueberries",
      servingSize: { unit: "g", amount: 100 },
      nutritionFacts: {
        calories: { unit: "kcal", value: 100 },
        fat: { unit: "g", amount: 0.3 },
        carbs: { unit: "grams", amount: 23 },
        sodium: { unit: "g", amount: 0 },
      },
    },
    expectedIssues: [
      {
        kind: "schema",
        message: 'Invalid key: Expected "amount" but received undefined',
        path: [
          { key: "nutritionFacts" },
          { key: "calories" },
          { key: "amount" },
        ],
      },
      {
        kind: "schema",
        message: 'Invalid key: Expected never but received "value"',
        path: [
          { key: "nutritionFacts" },
          { key: "calories" },
          { key: "value" },
        ],
      },
      {
        kind: "schema",
        message: 'Invalid type: Expected "g" but received "grams"',
        path: [{ key: "nutritionFacts" }, { key: "carbs" }, { key: "unit" }],
      },
      {
        kind: "schema",
        message: 'Invalid key: Expected "protein" but received undefined',
        path: [{ key: "nutritionFacts" }, { key: "protein" }],
      },
      {
        kind: "schema",
        message: 'Invalid key: Expected never but received "sodium"',
        path: [{ key: "nutritionFacts" }, { key: "sodium" }],
      },
    ],
  });
});
