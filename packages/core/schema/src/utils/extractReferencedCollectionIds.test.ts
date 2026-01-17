import { describe, expect, it } from "vitest";
import DataType from "../DataType.js";
import type Schema from "../Schema.js";
import extractReferencedCollectionIds from "./extractReferencedCollectionIds.js";

describe("extractReferencedCollectionIds", () => {
  it("returns empty array for schema with no DocumentRef types", () => {
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            name: { dataType: DataType.String },
          },
        },
      },
      rootType: "Root",
    };

    const result = extractReferencedCollectionIds(schema);

    expect(result).toEqual([]);
  });

  it("returns empty array for DocumentRef without collectionId constraint", () => {
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            documentRef: { dataType: DataType.DocumentRef },
          },
        },
      },
      rootType: "Root",
    };

    const result = extractReferencedCollectionIds(schema);

    expect(result).toEqual([]);
  });

  it("returns collectionId for DocumentRef with constraint", () => {
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            documentRef: {
              dataType: DataType.DocumentRef,
              collectionId: "Collection_0",
            },
          },
        },
      },
      rootType: "Root",
    };

    const result = extractReferencedCollectionIds(schema);

    expect(result).toEqual(["Collection_0"]);
  });

  it("returns unique collectionIds for multiple DocumentRefs", () => {
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            documentRef1: {
              dataType: DataType.DocumentRef,
              collectionId: "Collection_0",
            },
            documentRef2: {
              dataType: DataType.DocumentRef,
              collectionId: "Collection_1",
            },
            documentRef3: {
              dataType: DataType.DocumentRef,
              collectionId: "Collection_0",
            },
          },
        },
      },
      rootType: "Root",
    };

    const result = extractReferencedCollectionIds(schema);

    expect(result).toEqual(["Collection_0", "Collection_1"]);
  });

  it("finds DocumentRef nested in Struct", () => {
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nested: {
              dataType: DataType.Struct,
              properties: {
                documentRef: {
                  dataType: DataType.DocumentRef,
                  collectionId: "Collection_0",
                },
              },
            },
          },
        },
      },
      rootType: "Root",
    };

    const result = extractReferencedCollectionIds(schema);

    expect(result).toEqual(["Collection_0"]);
  });

  it("finds DocumentRef in List items", () => {
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            refs: {
              dataType: DataType.List,
              items: {
                dataType: DataType.DocumentRef,
                collectionId: "Collection_0",
              },
            },
          },
        },
      },
      rootType: "Root",
    };

    const result = extractReferencedCollectionIds(schema);

    expect(result).toEqual(["Collection_0"]);
  });

  it("finds DocumentRef via type reference", () => {
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            documentRef: {
              dataType: null,
              ref: "MyDocRef",
            },
          },
        },
        MyDocRef: {
          dataType: DataType.DocumentRef,
          collectionId: "Collection_0",
        },
      },
      rootType: "Root",
    };

    const result = extractReferencedCollectionIds(schema);

    expect(result).toEqual(["Collection_0"]);
  });

  it("finds DocumentRef via nested type reference", () => {
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nested: {
              dataType: null,
              ref: "NestedStruct",
            },
          },
        },
        NestedStruct: {
          dataType: DataType.Struct,
          properties: {
            documentRef: {
              dataType: DataType.DocumentRef,
              collectionId: "Collection_0",
            },
          },
        },
      },
      rootType: "Root",
    };

    const result = extractReferencedCollectionIds(schema);

    expect(result).toEqual(["Collection_0"]);
  });

  it("combines DocumentRefs from multiple sources", () => {
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            direct: {
              dataType: DataType.DocumentRef,
              collectionId: "Collection_0",
            },
            list: {
              dataType: DataType.List,
              items: {
                dataType: DataType.DocumentRef,
                collectionId: "Collection_1",
              },
            },
            nested: {
              dataType: DataType.Struct,
              properties: {
                ref: {
                  dataType: DataType.DocumentRef,
                  collectionId: "Collection_2",
                },
              },
            },
            viaRef: {
              dataType: null,
              ref: "RefType",
            },
          },
        },
        RefType: {
          dataType: DataType.DocumentRef,
          collectionId: "Collection_3",
        },
      },
      rootType: "Root",
    };

    const result = extractReferencedCollectionIds(schema);

    expect(result).toEqual([
      "Collection_0",
      "Collection_1",
      "Collection_2",
      "Collection_3",
    ]);
  });
});
