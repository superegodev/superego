import { describe, expect, it } from "vitest";
import DataType from "../DataType.js";
import type Schema from "../Schema.js";
import {
  extractProtoCollectionIds,
  isProtoCollectionId,
  makeProtoCollectionId,
  makeProtoCollectionIdMapping,
  parseProtoCollectionIndex,
  replaceProtoCollectionIds,
} from "./protoCollectionIds.js";

describe("makeProtoCollectionId", () => {
  it("returns correct format", () => {
    // Exercise
    const result0 = makeProtoCollectionId(0);
    const result1 = makeProtoCollectionId(1);
    const result42 = makeProtoCollectionId(42);

    // Verify
    expect(result0).toBe("ProtoCollection_0");
    expect(result1).toBe("ProtoCollection_1");
    expect(result42).toBe("ProtoCollection_42");
  });

  it.each([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  ])("roundtrips index %i correctly", (index) => {
    // Exercise + Verify
    const protoId = makeProtoCollectionId(index);
    expect(isProtoCollectionId(protoId)).toBe(true);
    expect(parseProtoCollectionIndex(protoId)).toBe(index);
  });
});

describe("makeProtoCollectionIdMapping", () => {
  it("creates correct mapping from array of actual IDs", () => {
    // Exercise
    const actualIds = ["Collection_abc", "Collection_def", "Collection_ghi"];
    const mapping = makeProtoCollectionIdMapping(actualIds);

    // Verify
    expect(mapping.get("ProtoCollection_0")).toBe("Collection_abc");
    expect(mapping.get("ProtoCollection_1")).toBe("Collection_def");
    expect(mapping.get("ProtoCollection_2")).toBe("Collection_ghi");
    expect(mapping.size).toBe(3);
  });

  it("handles empty array", () => {
    // Exercise
    const mapping = makeProtoCollectionIdMapping([]);

    // Verify
    expect(mapping.size).toBe(0);
  });
});

describe("isProtoCollectionId", () => {
  it("returns true for proto collection IDs", () => {
    // Exercise + Verify
    expect(isProtoCollectionId("ProtoCollection_0")).toBe(true);
    expect(isProtoCollectionId("ProtoCollection_42")).toBe(true);
  });

  it("returns false for regular collection IDs", () => {
    // Exercise + Verify
    expect(isProtoCollectionId("Collection_abc")).toBe(false);
    expect(isProtoCollectionId("abc")).toBe(false);
    expect(isProtoCollectionId("ProtoDocument_0")).toBe(false);
  });
});

describe("parseProtoCollectionIndex", () => {
  it("extracts index from proto collection ID", () => {
    // Exercise + Verify
    expect(parseProtoCollectionIndex("ProtoCollection_0")).toBe(0);
    expect(parseProtoCollectionIndex("ProtoCollection_42")).toBe(42);
  });

  it("returns null for non-proto collection IDs", () => {
    // Exercise + Verify
    expect(parseProtoCollectionIndex("Collection_abc")).toBe(null);
    expect(parseProtoCollectionIndex("ProtoDocument_0")).toBe(null);
  });

  it("returns null for invalid index", () => {
    // Exercise + Verify
    expect(parseProtoCollectionIndex("ProtoCollection_-1")).toBe(null);
    expect(parseProtoCollectionIndex("ProtoCollection_abc")).toBe(null);
  });
});

describe("extractProtoCollectionIds", () => {
  it("returns empty array when schema has no DocumentRef types", () => {
    // Exercise
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
    const result = extractProtoCollectionIds(schema);

    // Verify
    expect(result).toEqual([]);
  });

  it("returns empty array when DocumentRef has no collectionId", () => {
    // Exercise
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
    const result = extractProtoCollectionIds(schema);

    // Verify
    expect(result).toEqual([]);
  });

  it("returns empty array when DocumentRef has a regular collectionId", () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            documentRef: {
              dataType: DataType.DocumentRef,
              collectionId: "Collection_123",
            },
          },
        },
      },
      rootType: "Root",
    };
    const result = extractProtoCollectionIds(schema);

    // Verify
    expect(result).toEqual([]);
  });

  it("extracts a single proto collection ID", () => {
    // Exercise
    const protoId = makeProtoCollectionId(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref: {
              dataType: DataType.DocumentRef,
              collectionId: protoId,
            },
          },
        },
      },
      rootType: "Root",
    };
    const result = extractProtoCollectionIds(schema);

    // Verify
    expect(result).toEqual([protoId]);
  });

  it("extracts multiple different proto collection IDs", () => {
    // Exercise
    const protoId0 = makeProtoCollectionId(0);
    const protoId1 = makeProtoCollectionId(1);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref0: {
              dataType: DataType.DocumentRef,
              collectionId: protoId0,
            },
            ref1: {
              dataType: DataType.DocumentRef,
              collectionId: protoId1,
            },
          },
        },
      },
      rootType: "Root",
    };
    const result = extractProtoCollectionIds(schema);

    // Verify
    expect(result).toHaveLength(2);
    expect(result).toContain(protoId0);
    expect(result).toContain(protoId1);
  });

  it("deduplicates repeated proto collection IDs", () => {
    // Exercise
    const protoId = makeProtoCollectionId(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref1: {
              dataType: DataType.DocumentRef,
              collectionId: protoId,
            },
            ref2: {
              dataType: DataType.DocumentRef,
              collectionId: protoId,
            },
          },
        },
      },
      rootType: "Root",
    };
    const result = extractProtoCollectionIds(schema);

    // Verify
    expect(result).toEqual([protoId]);
  });

  it("extracts proto collection IDs from nested Structs", () => {
    // Exercise
    const protoId = makeProtoCollectionId(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nested: {
              dataType: DataType.Struct,
              properties: {
                ref: {
                  dataType: DataType.DocumentRef,
                  collectionId: protoId,
                },
              },
            },
          },
        },
      },
      rootType: "Root",
    };
    const result = extractProtoCollectionIds(schema);

    // Verify
    expect(result).toEqual([protoId]);
  });

  it("extracts proto collection IDs from List items", () => {
    // Exercise
    const protoId = makeProtoCollectionId(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            items: {
              dataType: DataType.List,
              items: {
                dataType: DataType.DocumentRef,
                collectionId: protoId,
              },
            },
          },
        },
      },
      rootType: "Root",
    };
    const result = extractProtoCollectionIds(schema);

    // Verify
    expect(result).toEqual([protoId]);
  });

  it("extracts proto collection IDs through TypeRef", () => {
    // Exercise
    const protoId = makeProtoCollectionId(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref: {
              dataType: null,
              ref: "ProtoRef",
            },
          },
        },
        ProtoRef: {
          dataType: DataType.DocumentRef,
          collectionId: protoId,
        },
      },
      rootType: "Root",
    };
    const result = extractProtoCollectionIds(schema);

    // Verify
    expect(result).toEqual([protoId]);
  });

  it("extracts from multiple types in schema", () => {
    // Exercise
    const protoId0 = makeProtoCollectionId(0);
    const protoId1 = makeProtoCollectionId(1);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            name: { dataType: DataType.String },
          },
        },
        Type1: {
          dataType: DataType.DocumentRef,
          collectionId: protoId0,
        },
        Type2: {
          dataType: DataType.DocumentRef,
          collectionId: protoId1,
        },
      },
      rootType: "Root",
    };
    const result = extractProtoCollectionIds(schema);

    // Verify
    expect(result).toHaveLength(2);
    expect(result).toContain(protoId0);
    expect(result).toContain(protoId1);
  });

  it("ignores regular collection IDs while extracting proto ones", () => {
    // Exercise
    const protoId = makeProtoCollectionId(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            proto: {
              dataType: DataType.DocumentRef,
              collectionId: protoId,
            },
            regular: {
              dataType: DataType.DocumentRef,
              collectionId: "Collection_123",
            },
          },
        },
      },
      rootType: "Root",
    };
    const result = extractProtoCollectionIds(schema);

    // Verify
    expect(result).toEqual([protoId]);
  });
});

describe("replaceProtoCollectionIds", () => {
  it("returns schema unchanged when no proto collection IDs exist", () => {
    // Exercise
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
    const idMapping = new Map<string, string>();
    const result = replaceProtoCollectionIds(schema, idMapping);

    // Verify
    expect(result).toEqual(schema);
  });

  it("replaces a single proto collection ID", () => {
    // Exercise
    const protoId = makeProtoCollectionId(0);
    const actualId = "Collection_abc123";
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref: {
              dataType: DataType.DocumentRef,
              collectionId: protoId,
            },
          },
        },
      },
      rootType: "Root",
    };
    const idMapping = new Map([[protoId, actualId]]);
    const result = replaceProtoCollectionIds(schema, idMapping);

    // Verify
    expect(result.types["Root"]).toEqual({
      dataType: DataType.Struct,
      properties: {
        ref: {
          dataType: DataType.DocumentRef,
          collectionId: actualId,
        },
      },
    });
  });

  it("replaces multiple proto collection IDs", () => {
    // Exercise
    const protoId0 = makeProtoCollectionId(0);
    const protoId1 = makeProtoCollectionId(1);
    const actualId0 = "Collection_first";
    const actualId1 = "Collection_second";
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref0: {
              dataType: DataType.DocumentRef,
              collectionId: protoId0,
            },
            ref1: {
              dataType: DataType.DocumentRef,
              collectionId: protoId1,
            },
          },
        },
      },
      rootType: "Root",
    };
    const idMapping = new Map([
      [protoId0, actualId0],
      [protoId1, actualId1],
    ]);
    const result = replaceProtoCollectionIds(schema, idMapping);

    // Verify
    expect(result.types["Root"]).toEqual({
      dataType: DataType.Struct,
      properties: {
        ref0: {
          dataType: DataType.DocumentRef,
          collectionId: actualId0,
        },
        ref1: {
          dataType: DataType.DocumentRef,
          collectionId: actualId1,
        },
      },
    });
  });

  it("replaces proto collection IDs in nested Structs", () => {
    // Exercise
    const protoId = makeProtoCollectionId(0);
    const actualId = "Collection_nested";
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nested: {
              dataType: DataType.Struct,
              properties: {
                ref: {
                  dataType: DataType.DocumentRef,
                  collectionId: protoId,
                },
              },
            },
          },
        },
      },
      rootType: "Root",
    };
    const idMapping = new Map([[protoId, actualId]]);
    const result = replaceProtoCollectionIds(schema, idMapping);

    // Verify
    expect(result.types["Root"]).toEqual({
      dataType: DataType.Struct,
      properties: {
        nested: {
          dataType: DataType.Struct,
          properties: {
            ref: {
              dataType: DataType.DocumentRef,
              collectionId: actualId,
            },
          },
        },
      },
    });
  });

  it("replaces proto collection IDs in List items", () => {
    // Exercise
    const protoId = makeProtoCollectionId(0);
    const actualId = "Collection_list";
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            items: {
              dataType: DataType.List,
              items: {
                dataType: DataType.DocumentRef,
                collectionId: protoId,
              },
            },
          },
        },
      },
      rootType: "Root",
    };
    const idMapping = new Map([[protoId, actualId]]);
    const result = replaceProtoCollectionIds(schema, idMapping);

    // Verify
    expect(result.types["Root"]).toEqual({
      dataType: DataType.Struct,
      properties: {
        items: {
          dataType: DataType.List,
          items: {
            dataType: DataType.DocumentRef,
            collectionId: actualId,
          },
        },
      },
    });
  });

  it("leaves proto collection ID unchanged if not in mapping", () => {
    // Exercise
    const protoId = makeProtoCollectionId(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref: {
              dataType: DataType.DocumentRef,
              collectionId: protoId,
            },
          },
        },
      },
      rootType: "Root",
    };
    const emptyIdMapping = new Map<string, string>();
    const result = replaceProtoCollectionIds(schema, emptyIdMapping);

    // Verify
    expect(result.types["Root"]).toEqual({
      dataType: DataType.Struct,
      properties: {
        ref: {
          dataType: DataType.DocumentRef,
          collectionId: protoId,
        },
      },
    });
  });

  it("leaves regular collection IDs unchanged", () => {
    // Exercise
    const regularId = "Collection_existing";
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref: {
              dataType: DataType.DocumentRef,
              collectionId: regularId,
            },
          },
        },
      },
      rootType: "Root",
    };
    const idMapping = new Map<string, string>();
    const result = replaceProtoCollectionIds(schema, idMapping);

    // Verify
    expect(result.types["Root"]).toEqual({
      dataType: DataType.Struct,
      properties: {
        ref: {
          dataType: DataType.DocumentRef,
          collectionId: regularId,
        },
      },
    });
  });
});
