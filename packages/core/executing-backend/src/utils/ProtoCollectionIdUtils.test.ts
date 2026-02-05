import type { CollectionId } from "@superego/backend";
import { DataType, type Schema } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { describe, expect, it } from "vitest";
import {
  extractProtoCollectionIds,
  makeProtoCollectionIdMapping,
  replaceProtoCollectionIds,
} from "./ProtoCollectionIdUtils.js";

describe("makeProtoCollectionIdMapping", () => {
  it("creates correct mapping from array of collection IDs", () => {
    // Exercise
    const collectionIds: CollectionId[] = [
      Id.generate.collection(),
      Id.generate.collection(),
      Id.generate.collection(),
    ];
    const mapping = makeProtoCollectionIdMapping(collectionIds);

    // Verify
    expect(mapping.get("ProtoCollection_0")).toBe(collectionIds[0]);
    expect(mapping.get("ProtoCollection_1")).toBe(collectionIds[1]);
    expect(mapping.get("ProtoCollection_2")).toBe(collectionIds[2]);
    expect(mapping.size).toBe(3);
  });

  it("handles empty array", () => {
    // Exercise
    const mapping = makeProtoCollectionIdMapping([]);

    // Verify
    expect(mapping.size).toBe(0);
  });
});

describe("extractProtoCollectionIds", () => {
  it("returns empty set when schema has no DocumentRef types", () => {
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
    expect(result.size).toBe(0);
  });

  it("returns empty set when DocumentRef has no collectionId", () => {
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
    expect(result.size).toBe(0);
  });

  it("returns empty set when DocumentRef has a regular collectionId", () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            documentRef: {
              dataType: DataType.DocumentRef,
              collectionId: Id.generate.collection(),
            },
          },
        },
      },
      rootType: "Root",
    };
    const result = extractProtoCollectionIds(schema);

    // Verify
    expect(result.size).toBe(0);
  });

  it("extracts a single proto collection ID", () => {
    // Exercise
    const protoCollectionId = Id.generate.protoCollection(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref: {
              dataType: DataType.DocumentRef,
              collectionId: protoCollectionId,
            },
          },
        },
      },
      rootType: "Root",
    };
    const result = extractProtoCollectionIds(schema);

    // Verify
    expect(result.size).toBe(1);
    expect(result.has(protoCollectionId)).toBe(true);
  });

  it("extracts multiple different proto collection IDs", () => {
    // Exercise
    const protoCollectionId0 = Id.generate.protoCollection(0);
    const protoCollectionId1 = Id.generate.protoCollection(1);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref0: {
              dataType: DataType.DocumentRef,
              collectionId: protoCollectionId0,
            },
            ref1: {
              dataType: DataType.DocumentRef,
              collectionId: protoCollectionId1,
            },
          },
        },
      },
      rootType: "Root",
    };
    const result = extractProtoCollectionIds(schema);

    // Verify
    expect(result.size).toBe(2);
    expect(result.has(protoCollectionId0)).toBe(true);
    expect(result.has(protoCollectionId1)).toBe(true);
  });

  it("deduplicates repeated proto collection IDs", () => {
    // Exercise
    const protoCollectionId = Id.generate.protoCollection(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref1: {
              dataType: DataType.DocumentRef,
              collectionId: protoCollectionId,
            },
            ref2: {
              dataType: DataType.DocumentRef,
              collectionId: protoCollectionId,
            },
          },
        },
      },
      rootType: "Root",
    };
    const result = extractProtoCollectionIds(schema);

    // Verify
    expect(result.size).toBe(1);
    expect(result.has(protoCollectionId)).toBe(true);
  });

  it("extracts proto collection IDs from nested Structs", () => {
    // Exercise
    const protoCollectionId = Id.generate.protoCollection(0);
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
                  collectionId: protoCollectionId,
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
    expect(result.size).toBe(1);
    expect(result.has(protoCollectionId)).toBe(true);
  });

  it("extracts proto collection IDs from List items", () => {
    // Exercise
    const protoCollectionId = Id.generate.protoCollection(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            items: {
              dataType: DataType.List,
              items: {
                dataType: DataType.DocumentRef,
                collectionId: protoCollectionId,
              },
            },
          },
        },
      },
      rootType: "Root",
    };
    const result = extractProtoCollectionIds(schema);

    // Verify
    expect(result.size).toBe(1);
    expect(result.has(protoCollectionId)).toBe(true);
  });

  it("extracts proto collection IDs through TypeRef", () => {
    // Exercise
    const protoCollectionId = Id.generate.protoCollection(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref: {
              dataType: null as any,
              ref: "ProtoRef",
            },
          },
        },
        ProtoRef: {
          dataType: DataType.DocumentRef,
          collectionId: protoCollectionId,
        },
      },
      rootType: "Root",
    };
    const result = extractProtoCollectionIds(schema);

    // Verify
    expect(result.size).toBe(1);
    expect(result.has(protoCollectionId)).toBe(true);
  });

  it("extracts from multiple types in schema", () => {
    // Exercise
    const protoCollectionId0 = Id.generate.protoCollection(0);
    const protoCollectionId1 = Id.generate.protoCollection(1);
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
          collectionId: protoCollectionId0,
        },
        Type2: {
          dataType: DataType.DocumentRef,
          collectionId: protoCollectionId1,
        },
      },
      rootType: "Root",
    };
    const result = extractProtoCollectionIds(schema);

    // Verify
    expect(result.size).toBe(2);
    expect(result.has(protoCollectionId0)).toBe(true);
    expect(result.has(protoCollectionId1)).toBe(true);
  });

  it("ignores regular collection IDs while extracting proto ones", () => {
    // Exercise
    const protoCollectionId = Id.generate.protoCollection(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            proto: {
              dataType: DataType.DocumentRef,
              collectionId: protoCollectionId,
            },
            regular: {
              dataType: DataType.DocumentRef,
              collectionId: Id.generate.collection(),
            },
          },
        },
      },
      rootType: "Root",
    };
    const result = extractProtoCollectionIds(schema);

    // Verify
    expect(result.size).toBe(1);
    expect(result.has(protoCollectionId)).toBe(true);
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
    const result = replaceProtoCollectionIds(schema, idMapping as any);

    // Verify
    expect(result).toEqual(schema);
  });

  it("replaces a single proto collection ID", () => {
    // Exercise
    const protoCollectionId = Id.generate.protoCollection(0);
    const collectionId = Id.generate.collection();
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref: {
              dataType: DataType.DocumentRef,
              collectionId: protoCollectionId,
            },
          },
        },
      },
      rootType: "Root",
    };
    const idMapping = new Map([[protoCollectionId, collectionId]]);
    const result = replaceProtoCollectionIds(schema, idMapping);

    // Verify
    expect(result.types["Root"]).toEqual({
      dataType: DataType.Struct,
      properties: {
        ref: {
          dataType: DataType.DocumentRef,
          collectionId: collectionId,
        },
      },
    });
  });

  it("replaces multiple proto collection IDs", () => {
    // Exercise
    const protoCollectionId0 = Id.generate.protoCollection(0);
    const protoCollectionId1 = Id.generate.protoCollection(1);
    const collectionId0 = Id.generate.collection();
    const collectionId1 = Id.generate.collection();
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref0: {
              dataType: DataType.DocumentRef,
              collectionId: protoCollectionId0,
            },
            ref1: {
              dataType: DataType.DocumentRef,
              collectionId: protoCollectionId1,
            },
          },
        },
      },
      rootType: "Root",
    };
    const idMapping = new Map([
      [protoCollectionId0, collectionId0],
      [protoCollectionId1, collectionId1],
    ]);
    const result = replaceProtoCollectionIds(schema, idMapping);

    // Verify
    expect(result.types["Root"]).toEqual({
      dataType: DataType.Struct,
      properties: {
        ref0: {
          dataType: DataType.DocumentRef,
          collectionId: collectionId0,
        },
        ref1: {
          dataType: DataType.DocumentRef,
          collectionId: collectionId1,
        },
      },
    });
  });

  it("replaces proto collection IDs in nested Structs", () => {
    // Exercise
    const protoCollectionId = Id.generate.protoCollection(0);
    const collectionId = Id.generate.collection();
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
                  collectionId: protoCollectionId,
                },
              },
            },
          },
        },
      },
      rootType: "Root",
    };
    const idMapping = new Map([[protoCollectionId, collectionId]]);
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
              collectionId: collectionId,
            },
          },
        },
      },
    });
  });

  it("replaces proto collection IDs in List items", () => {
    // Exercise
    const protoCollectionId = Id.generate.protoCollection(0);
    const collectionId = Id.generate.collection();
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            items: {
              dataType: DataType.List,
              items: {
                dataType: DataType.DocumentRef,
                collectionId: protoCollectionId,
              },
            },
          },
        },
      },
      rootType: "Root",
    };
    const idMapping = new Map([[protoCollectionId, collectionId]]);
    const result = replaceProtoCollectionIds(schema, idMapping);

    // Verify
    expect(result.types["Root"]).toEqual({
      dataType: DataType.Struct,
      properties: {
        items: {
          dataType: DataType.List,
          items: {
            dataType: DataType.DocumentRef,
            collectionId: collectionId,
          },
        },
      },
    });
  });

  it("leaves proto collection ID unchanged if not in mapping", () => {
    // Exercise
    const protoCollectionId = Id.generate.protoCollection(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref: {
              dataType: DataType.DocumentRef,
              collectionId: protoCollectionId,
            },
          },
        },
      },
      rootType: "Root",
    };
    const emptyIdMapping = new Map<string, string>();
    const result = replaceProtoCollectionIds(schema, emptyIdMapping as any);

    // Verify
    expect(result.types["Root"]).toEqual({
      dataType: DataType.Struct,
      properties: {
        ref: {
          dataType: DataType.DocumentRef,
          collectionId: protoCollectionId,
        },
      },
    });
  });

  it("leaves regular collection IDs unchanged", () => {
    // Exercise
    const collectionId = Id.generate.collection();
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref: {
              dataType: DataType.DocumentRef,
              collectionId: collectionId,
            },
          },
        },
      },
      rootType: "Root",
    };
    const idMapping = new Map<string, string>();
    const result = replaceProtoCollectionIds(schema, idMapping as any);

    // Verify
    expect(result.types["Root"]).toEqual({
      dataType: DataType.Struct,
      properties: {
        ref: {
          dataType: DataType.DocumentRef,
          collectionId: collectionId,
        },
      },
    });
  });
});
