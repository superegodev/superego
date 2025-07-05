import { DataType, type Schema } from "@superego/schema";
import { describe, expect, it } from "vitest";
import findFileNodes, { type FileNode } from "./findFileNodes.js";

//////////////////////////////
// Test function definition //
//////////////////////////////

interface TestCase {
  schema: Schema;
  value: any;
  expectedFileNodes: FileNode[];
}
const test = (
  name: string,
  { value, schema, expectedFileNodes }: TestCase,
  only?: boolean,
) => {
  it(name, { only: only ?? false }, () => {
    // Exercise
    const foundFileNodes = findFileNodes(schema, value);
    // Verify
    expect(sortByPath(foundFileNodes)).toEqual(sortByPath(expectedFileNodes));
  });
};
test.only = (name: string, testCase: TestCase) => test(name, testCase, true);

const sortByPath = (fileNodes: FileNode[]): FileNode[] =>
  fileNodes.toSorted((a, b) => {
    const aPath = a.path.join();
    const bPath = b.path.join();
    return aPath === bPath ? 0 : aPath < bPath ? 1 : -1;
  });

///////////
// Tests //
///////////

describe("finds all file nodes in the given value", () => {
  test("no file properties", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nonNullableString: {
              dataType: DataType.String,
            },
          },
        },
      },
      rootType: "Root",
    },
    value: {
      nonNullableString: "nonNullableString",
    },
    expectedFileNodes: [],
  });

  test("non-nullable file property", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nonNullableFile: {
              dataType: DataType.File,
            },
          },
        },
      },
      rootType: "Root",
    },
    value: {
      nonNullableFile: {
        id: "file_0",
        name: "name",
        mimeType: "mimeType",
      },
    },
    expectedFileNodes: [
      {
        path: ["nonNullableFile"],
        value: {
          id: "file_0",
          name: "name",
          mimeType: "mimeType",
        },
      },
    ],
  });

  test("nullable file property, value is not null", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nullableFile: {
              dataType: DataType.File,
            },
          },
          nullableProperties: ["nullableFile"],
        },
      },
      rootType: "Root",
    },
    value: {
      nullableFile: {
        id: "file_0",
        name: "name",
        mimeType: "mimeType",
      },
    },
    expectedFileNodes: [
      {
        path: ["nullableFile"],
        value: {
          id: "file_0",
          name: "name",
          mimeType: "mimeType",
        },
      },
    ],
  });

  test("nullable file property, value is null", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nullableFile: {
              dataType: DataType.File,
            },
          },
          nullableProperties: ["nullableFile"],
        },
      },
      rootType: "Root",
    },
    value: {
      nullableFile: null,
    },
    expectedFileNodes: [],
  });

  test("nested non-nullable file property", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nestedStruct: {
              dataType: DataType.Struct,
              properties: {
                nonNullableFile: {
                  dataType: DataType.File,
                },
              },
            },
          },
        },
      },
      rootType: "Root",
    },
    value: {
      nestedStruct: {
        nonNullableFile: {
          id: "file_0",
          name: "name",
          mimeType: "mimeType",
        },
      },
    },
    expectedFileNodes: [
      {
        path: ["nestedStruct", "nonNullableFile"],
        value: {
          id: "file_0",
          name: "name",
          mimeType: "mimeType",
        },
      },
    ],
  });

  test("nested nullable file property, value is not null", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nestedStruct: {
              dataType: DataType.Struct,
              properties: {
                nullableFile: {
                  dataType: DataType.File,
                },
              },
              nullableProperties: ["nullableFile"],
            },
          },
        },
      },
      rootType: "Root",
    },
    value: {
      nestedStruct: {
        nullableFile: {
          id: "file_0",
          name: "name",
          mimeType: "mimeType",
        },
      },
    },
    expectedFileNodes: [
      {
        path: ["nestedStruct", "nullableFile"],
        value: {
          id: "file_0",
          name: "name",
          mimeType: "mimeType",
        },
      },
    ],
  });

  test("nested nullable file property, value is null", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nestedStruct: {
              dataType: DataType.Struct,
              properties: {
                nullableFile: {
                  dataType: DataType.File,
                },
              },
              nullableProperties: ["nullableFile"],
            },
          },
        },
      },
      rootType: "Root",
    },
    value: {
      nestedStruct: {
        nullableFile: null,
      },
    },
    expectedFileNodes: [],
  });

  test("list with file items, empty", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            listWithFileItems: {
              dataType: DataType.List,
              items: {
                dataType: DataType.File,
              },
            },
          },
        },
      },
      rootType: "Root",
    },
    value: {
      listWithFileItems: [],
    },
    expectedFileNodes: [],
  });

  test("list with file items, non-empty", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            listWithFileItems: {
              dataType: DataType.List,
              items: {
                dataType: DataType.File,
              },
            },
          },
        },
      },
      rootType: "Root",
    },
    value: {
      listWithFileItems: [
        {
          id: "file_0",
          name: "name",
          mimeType: "mimeType",
        },
      ],
    },
    expectedFileNodes: [
      {
        path: ["listWithFileItems", "0"],
        value: {
          id: "file_0",
          name: "name",
          mimeType: "mimeType",
        },
      },
    ],
  });

  test("ignoring values that happen to be FileRefs inside JsonObjects", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            jsonObject: {
              dataType: DataType.JsonObject,
            },
          },
        },
      },
      rootType: "Root",
    },
    value: {
      jsonObject: {
        __dataType: DataType.JsonObject,
        id: "file_0",
        name: "name",
        mimeType: "mimeType",
      },
    },
    expectedFileNodes: [],
  });

  test("finding multiple file nodes", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            file0: {
              dataType: DataType.File,
            },
            file1: {
              dataType: DataType.File,
            },
          },
        },
      },
      rootType: "Root",
    },
    value: {
      file0: {
        id: "file_0",
        name: "name",
        mimeType: "mimeType",
      },
      file1: {
        id: "file_1",
        name: "name",
        mimeType: "mimeType",
      },
    },
    expectedFileNodes: [
      {
        path: ["file0"],
        value: {
          id: "file_0",
          name: "name",
          mimeType: "mimeType",
        },
      },
      {
        path: ["file1"],
        value: {
          id: "file_1",
          name: "name",
          mimeType: "mimeType",
        },
      },
    ],
  });

  test("schema with directly ref-ed file type definition", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nonNullableFile: {
              dataType: null,
              ref: "File",
            },
          },
        },
        File: {
          dataType: DataType.File,
        },
      },
      rootType: "Root",
    },
    value: {
      nonNullableFile: {
        id: "file_0",
        name: "name",
        mimeType: "mimeType",
      },
    },
    expectedFileNodes: [
      {
        path: ["nonNullableFile"],
        value: {
          id: "file_0",
          name: "name",
          mimeType: "mimeType",
        },
      },
    ],
  });

  test("schema with indirectly ref-ed file type definition", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            fileRecord: {
              dataType: null,
              ref: "FileRecord",
            },
          },
        },
        FileRecord: {
          dataType: DataType.Struct,
          properties: {
            file0: {
              dataType: DataType.File,
            },
          },
        },
      },
      rootType: "Root",
    },
    value: {
      fileRecord: {
        file0: {
          id: "file_0",
          name: "name",
          mimeType: "mimeType",
        },
      },
    },
    expectedFileNodes: [
      {
        path: ["fileRecord", "file0"],
        value: {
          id: "file_0",
          name: "name",
          mimeType: "mimeType",
        },
      },
    ],
  });
});
