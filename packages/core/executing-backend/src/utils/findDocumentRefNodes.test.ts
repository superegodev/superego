import { DataType, type Schema } from "@superego/schema";
import { describe, expect, it } from "vitest";
import findDocumentRefNodes, {
  type DocumentRefNode,
} from "./findDocumentRefNodes.js";

//////////////////////////////
// Test function definition //
//////////////////////////////

interface TestCase {
  schema: Schema;
  value: any;
  expectedDocumentRefNodes: DocumentRefNode[];
}
const test = (
  name: string,
  { value, schema, expectedDocumentRefNodes }: TestCase,
  only?: boolean,
) => {
  it(name, { only: only ?? false }, () => {
    // Exercise
    const foundDocumentRefNodes = findDocumentRefNodes(schema, value);
    // Verify
    expect(sortByPath(foundDocumentRefNodes)).toEqual(
      sortByPath(expectedDocumentRefNodes),
    );
  });
};
test.only = (name: string, testCase: TestCase) => test(name, testCase, true);

const sortByPath = (nodes: DocumentRefNode[]): DocumentRefNode[] =>
  nodes.toSorted((a, b) => {
    const aPath = a.path.join();
    const bPath = b.path.join();
    return aPath === bPath ? 0 : aPath < bPath ? 1 : -1;
  });

///////////
// Tests //
///////////

describe("finds all document ref nodes in the given value", () => {
  test("no document ref properties", {
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
    expectedDocumentRefNodes: [],
  });

  test("non-nullable document ref property", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nonNullableDocumentRef: {
              dataType: DataType.DocumentRef,
            },
          },
        },
      },
      rootType: "Root",
    },
    value: {
      nonNullableDocumentRef: {
        collectionId: "Collection_0",
        documentId: "Document_0",
      },
    },
    expectedDocumentRefNodes: [
      {
        path: ["nonNullableDocumentRef"],
        value: {
          collectionId: "Collection_0",
          documentId: "Document_0",
        },
      },
    ],
  });

  test("nullable document ref property, value is not null", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nullableDocumentRef: {
              dataType: DataType.DocumentRef,
            },
          },
          nullableProperties: ["nullableDocumentRef"],
        },
      },
      rootType: "Root",
    },
    value: {
      nullableDocumentRef: {
        collectionId: "Collection_0",
        documentId: "Document_0",
      },
    },
    expectedDocumentRefNodes: [
      {
        path: ["nullableDocumentRef"],
        value: {
          collectionId: "Collection_0",
          documentId: "Document_0",
        },
      },
    ],
  });

  test("nullable document ref property, value is null", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nullableDocumentRef: {
              dataType: DataType.DocumentRef,
            },
          },
          nullableProperties: ["nullableDocumentRef"],
        },
      },
      rootType: "Root",
    },
    value: {
      nullableDocumentRef: null,
    },
    expectedDocumentRefNodes: [],
  });

  test("nested non-nullable document ref property", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nestedStruct: {
              dataType: DataType.Struct,
              properties: {
                nonNullableDocumentRef: {
                  dataType: DataType.DocumentRef,
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
        nonNullableDocumentRef: {
          collectionId: "Collection_0",
          documentId: "Document_0",
        },
      },
    },
    expectedDocumentRefNodes: [
      {
        path: ["nestedStruct", "nonNullableDocumentRef"],
        value: {
          collectionId: "Collection_0",
          documentId: "Document_0",
        },
      },
    ],
  });

  test("nested nullable document ref property, value is not null", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nestedStruct: {
              dataType: DataType.Struct,
              properties: {
                nullableDocumentRef: {
                  dataType: DataType.DocumentRef,
                },
              },
              nullableProperties: ["nullableDocumentRef"],
            },
          },
        },
      },
      rootType: "Root",
    },
    value: {
      nestedStruct: {
        nullableDocumentRef: {
          collectionId: "Collection_0",
          documentId: "Document_0",
        },
      },
    },
    expectedDocumentRefNodes: [
      {
        path: ["nestedStruct", "nullableDocumentRef"],
        value: {
          collectionId: "Collection_0",
          documentId: "Document_0",
        },
      },
    ],
  });

  test("nested nullable document ref property, value is null", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nestedStruct: {
              dataType: DataType.Struct,
              properties: {
                nullableDocumentRef: {
                  dataType: DataType.DocumentRef,
                },
              },
              nullableProperties: ["nullableDocumentRef"],
            },
          },
        },
      },
      rootType: "Root",
    },
    value: {
      nestedStruct: {
        nullableDocumentRef: null,
      },
    },
    expectedDocumentRefNodes: [],
  });

  test("list with document ref items, empty", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            listWithDocumentRefItems: {
              dataType: DataType.List,
              items: {
                dataType: DataType.DocumentRef,
              },
            },
          },
        },
      },
      rootType: "Root",
    },
    value: {
      listWithDocumentRefItems: [],
    },
    expectedDocumentRefNodes: [],
  });

  test("list with document ref items, non-empty", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            listWithDocumentRefItems: {
              dataType: DataType.List,
              items: {
                dataType: DataType.DocumentRef,
              },
            },
          },
        },
      },
      rootType: "Root",
    },
    value: {
      listWithDocumentRefItems: [
        {
          collectionId: "Collection_0",
          documentId: "Document_0",
        },
        {
          collectionId: "Collection_1",
          documentId: "Document_1",
        },
      ],
    },
    expectedDocumentRefNodes: [
      {
        path: ["listWithDocumentRefItems", "0"],
        value: {
          collectionId: "Collection_0",
          documentId: "Document_0",
        },
      },
      {
        path: ["listWithDocumentRefItems", "1"],
        value: {
          collectionId: "Collection_1",
          documentId: "Document_1",
        },
      },
    ],
  });

  test("ignoring values that happen to be DocumentRefs inside JsonObjects", {
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
        collectionId: "Collection_0",
        documentId: "Document_0",
      },
    },
    expectedDocumentRefNodes: [],
  });

  test("finding multiple document ref nodes", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            documentRef0: {
              dataType: DataType.DocumentRef,
            },
            documentRef1: {
              dataType: DataType.DocumentRef,
            },
          },
        },
      },
      rootType: "Root",
    },
    value: {
      documentRef0: {
        collectionId: "Collection_0",
        documentId: "Document_0",
      },
      documentRef1: {
        collectionId: "Collection_1",
        documentId: "Document_1",
      },
    },
    expectedDocumentRefNodes: [
      {
        path: ["documentRef0"],
        value: {
          collectionId: "Collection_0",
          documentId: "Document_0",
        },
      },
      {
        path: ["documentRef1"],
        value: {
          collectionId: "Collection_1",
          documentId: "Document_1",
        },
      },
    ],
  });

  test("schema with directly ref-ed document ref type definition", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nonNullableDocumentRef: {
              dataType: null,
              ref: "DocumentRef",
            },
          },
        },
        DocumentRef: {
          dataType: DataType.DocumentRef,
        },
      },
      rootType: "Root",
    },
    value: {
      nonNullableDocumentRef: {
        collectionId: "Collection_0",
        documentId: "Document_0",
      },
    },
    expectedDocumentRefNodes: [
      {
        path: ["nonNullableDocumentRef"],
        value: {
          collectionId: "Collection_0",
          documentId: "Document_0",
        },
      },
    ],
  });

  test("schema with indirectly ref-ed document ref type definition", {
    schema: {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            documentRefRecord: {
              dataType: null,
              ref: "DocumentRefRecord",
            },
          },
        },
        DocumentRefRecord: {
          dataType: DataType.Struct,
          properties: {
            documentRef0: {
              dataType: DataType.DocumentRef,
            },
          },
        },
      },
      rootType: "Root",
    },
    value: {
      documentRefRecord: {
        documentRef0: {
          collectionId: "Collection_0",
          documentId: "Document_0",
        },
      },
    },
    expectedDocumentRefNodes: [
      {
        path: ["documentRefRecord", "documentRef0"],
        value: {
          collectionId: "Collection_0",
          documentId: "Document_0",
        },
      },
    ],
  });
});
