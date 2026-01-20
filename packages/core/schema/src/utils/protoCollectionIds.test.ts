import { describe, expect, it } from "vitest";
import DataType from "../DataType.js";
import type Schema from "../Schema.js";
import {
  extractProtoCollectionIds,
  makeProtoCollectionId,
} from "./protoCollectionIds.js";

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
