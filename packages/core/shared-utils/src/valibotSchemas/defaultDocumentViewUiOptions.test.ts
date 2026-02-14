import type {
  DefaultDocumentViewUiOptions,
  ValidationIssue,
} from "@superego/backend";
import { DataType, type Schema } from "@superego/schema";
import * as v from "valibot";
import { expect, it } from "vitest";
import defaultDocumentViewUiOptions from "./defaultDocumentViewUiOptions.js";

//////////////////////////////
// Test function definition //
//////////////////////////////

interface TestCase {
  options: DefaultDocumentViewUiOptions;
  schema: Schema;
  expectedIssues: ValidationIssue[];
}
const test = (
  name: string,
  { options, schema, expectedIssues }: TestCase,
  only?: boolean,
) => {
  it(name, { only: only ?? false }, () => {
    // Setup SUT
    const valibotSchema = defaultDocumentViewUiOptions(schema);

    // Exercise
    const result = v.safeParse(valibotSchema, options);

    // Verify
    if (expectedIssues.length === 0) {
      expect(result.success).toBe(true);
    } else {
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.issues.map((issue) => ({
          message: issue.message,
          path: issue.path?.map((segment) => ({ key: segment.key })),
        }));
        expect(issues).toEqual(expectedIssues);
      }
    }
  });
};
test.only = (name: string, testCase: TestCase) => test(name, testCase, true);

///////////
// Tests //
///////////

test("empty options returns no issues", {
  options: {},
  schema: {
    types: {
      Root: {
        dataType: DataType.Struct,
        properties: {
          title: { dataType: DataType.String },
        },
      },
    },
    rootType: "Root",
  },
  expectedIssues: [],
});

test("no rootLayout returns no issues", {
  options: { fullWidth: false, collapsePrimarySidebar: false },
  schema: {
    types: {
      Root: {
        dataType: DataType.Struct,
        properties: {
          title: { dataType: DataType.String },
          body: { dataType: DataType.String },
        },
      },
    },
    rootType: "Root",
  },
  expectedIssues: [],
});

test("valid rootLayout with all properties returns no issues", {
  options: {
    fullWidth: false,
    collapsePrimarySidebar: false,
    rootLayout: [{ propertyPath: "title" }, { propertyPath: "body" }],
  },
  schema: {
    types: {
      Root: {
        dataType: DataType.Struct,
        properties: {
          title: { dataType: DataType.String },
          body: { dataType: DataType.String },
        },
      },
    },
    rootType: "Root",
  },
  expectedIssues: [],
});

test("missing property in layout reports issue", {
  options: {
    fullWidth: false,
    collapsePrimarySidebar: false,
    rootLayout: [{ propertyPath: "title" }],
  },
  schema: {
    types: {
      Root: {
        dataType: DataType.Struct,
        properties: {
          title: { dataType: DataType.String },
          body: { dataType: DataType.String },
        },
      },
    },
    rootType: "Root",
  },
  expectedIssues: [
    {
      message: `Layout is missing property "body".`,
      path: [{ key: "rootLayout" }],
    },
  ],
});

test("non-existent property path reports issue", {
  options: {
    fullWidth: false,
    collapsePrimarySidebar: false,
    rootLayout: [
      { propertyPath: "title" },
      { propertyPath: "body" },
      { propertyPath: "nonExistent" },
    ],
  },
  schema: {
    types: {
      Root: {
        dataType: DataType.Struct,
        properties: {
          title: { dataType: DataType.String },
          body: { dataType: DataType.String },
        },
      },
    },
    rootType: "Root",
  },
  expectedIssues: [
    {
      message: `Property path "nonExistent" does not exist in the schema.`,
      path: [{ key: "rootLayout" }, { key: 2 }, { key: "propertyPath" }],
    },
  ],
});

test("layout on non-Struct property reports issue", {
  options: {
    fullWidth: false,
    collapsePrimarySidebar: false,
    rootLayout: [
      { propertyPath: "title", layout: [] },
      { propertyPath: "body" },
    ],
  },
  schema: {
    types: {
      Root: {
        dataType: DataType.Struct,
        properties: {
          title: { dataType: DataType.String },
          body: { dataType: DataType.String },
        },
      },
    },
    rootType: "Root",
  },
  expectedIssues: [
    {
      message: `"layout" can only be defined on Struct properties, but "title" is ${DataType.String}.`,
      path: [{ key: "rootLayout" }, { key: 0 }, { key: "layout" }],
    },
  ],
});

test("layout on Struct property validates the nested layout", {
  options: {
    fullWidth: false,
    collapsePrimarySidebar: false,
    rootLayout: [
      {
        propertyPath: "nested",
        layout: [{ propertyPath: "nonExistent" }],
      },
    ],
  },
  schema: {
    types: {
      Root: {
        dataType: DataType.Struct,
        properties: {
          nested: {
            dataType: DataType.Struct,
            properties: {
              inner: { dataType: DataType.String },
            },
          },
        },
      },
    },
    rootType: "Root",
  },
  expectedIssues: [
    {
      message: `Property path "nonExistent" does not exist in the schema.`,
      path: [
        { key: "rootLayout" },
        { key: 0 },
        { key: "layout" },
        { key: 0 },
        { key: "propertyPath" },
      ],
    },
    {
      message: `Layout is missing property "inner".`,
      path: [{ key: "rootLayout" }, { key: 0 }, { key: "layout" }],
    },
  ],
});

test("allowCollapsing on non-Struct/List property reports issue", {
  options: {
    fullWidth: false,
    collapsePrimarySidebar: false,
    rootLayout: [
      { propertyPath: "title", allowCollapsing: true },
      { propertyPath: "body" },
    ],
  },
  schema: {
    types: {
      Root: {
        dataType: DataType.Struct,
        properties: {
          title: { dataType: DataType.String },
          body: { dataType: DataType.String },
        },
      },
    },
    rootType: "Root",
  },
  expectedIssues: [
    {
      message: `"allowCollapsing" can only be defined on Struct and List properties, but "title" is ${DataType.String}.`,
      path: [{ key: "rootLayout" }, { key: 0 }, { key: "allowCollapsing" }],
    },
  ],
});

test("allowCollapsing on Struct property is valid", {
  options: {
    fullWidth: false,
    collapsePrimarySidebar: false,
    rootLayout: [{ propertyPath: "nested", allowCollapsing: true }],
  },
  schema: {
    types: {
      Root: {
        dataType: DataType.Struct,
        properties: {
          nested: {
            dataType: DataType.Struct,
            properties: {},
          },
        },
      },
    },
    rootType: "Root",
  },
  expectedIssues: [],
});

test("allowCollapsing on List property is valid", {
  options: {
    fullWidth: false,
    collapsePrimarySidebar: false,
    rootLayout: [{ propertyPath: "items", allowCollapsing: false }],
  },
  schema: {
    types: {
      Root: {
        dataType: DataType.Struct,
        properties: {
          items: {
            dataType: DataType.List,
            items: { dataType: DataType.String },
          },
        },
      },
    },
    rootType: "Root",
  },
  expectedIssues: [],
});

test("DivNode with children validates recursively", {
  options: {
    fullWidth: false,
    collapsePrimarySidebar: false,
    rootLayout: [
      {
        children: [{ propertyPath: "title" }, { propertyPath: "body" }],
      },
    ],
  },
  schema: {
    types: {
      Root: {
        dataType: DataType.Struct,
        properties: {
          title: { dataType: DataType.String },
          body: { dataType: DataType.String },
        },
      },
    },
    rootType: "Root",
  },
  expectedIssues: [],
});

test("DivNode with missing property in children reports issue", {
  options: {
    fullWidth: false,
    collapsePrimarySidebar: false,
    rootLayout: [
      {
        children: [{ propertyPath: "title" }],
      },
    ],
  },
  schema: {
    types: {
      Root: {
        dataType: DataType.Struct,
        properties: {
          title: { dataType: DataType.String },
          body: { dataType: DataType.String },
        },
      },
    },
    rootType: "Root",
  },
  expectedIssues: [
    {
      message: `Layout is missing property "body".`,
      path: [{ key: "rootLayout" }, { key: 0 }, { key: "children" }],
    },
    {
      message: `Layout is missing property "body".`,
      path: [{ key: "rootLayout" }],
    },
  ],
});

test("nested property path extracts correct top-level name", {
  options: {
    fullWidth: false,
    collapsePrimarySidebar: false,
    rootLayout: [{ propertyPath: "nested.inner" }],
  },
  schema: {
    types: {
      Root: {
        dataType: DataType.Struct,
        properties: {
          nested: {
            dataType: DataType.Struct,
            properties: {
              inner: { dataType: DataType.String },
            },
          },
        },
      },
    },
    rootType: "Root",
  },
  expectedIssues: [],
});
