import { describe, expect, it } from "vitest";
import DataType from "../DataType.js";
import type Schema from "../Schema.js";
import {
  extractSuggestedCollectionIds,
  makeSuggestedCollectionId,
} from "./suggestedCollectionIds.js";

describe("extractSuggestedCollectionIds", () => {
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
    const result = extractSuggestedCollectionIds(schema);

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
    const result = extractSuggestedCollectionIds(schema);

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
    const result = extractSuggestedCollectionIds(schema);

    // Verify
    expect(result).toEqual([]);
  });

  it("extracts a single suggested collection ID", () => {
    // Exercise
    const suggestedId = makeSuggestedCollectionId(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref: {
              dataType: DataType.DocumentRef,
              collectionId: suggestedId,
            },
          },
        },
      },
      rootType: "Root",
    };
    const result = extractSuggestedCollectionIds(schema);

    // Verify
    expect(result).toEqual([suggestedId]);
  });

  it("extracts multiple different suggested collection IDs", () => {
    // Exercise
    const suggestedId0 = makeSuggestedCollectionId(0);
    const suggestedId1 = makeSuggestedCollectionId(1);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref0: {
              dataType: DataType.DocumentRef,
              collectionId: suggestedId0,
            },
            ref1: {
              dataType: DataType.DocumentRef,
              collectionId: suggestedId1,
            },
          },
        },
      },
      rootType: "Root",
    };
    const result = extractSuggestedCollectionIds(schema);

    // Verify
    expect(result).toHaveLength(2);
    expect(result).toContain(suggestedId0);
    expect(result).toContain(suggestedId1);
  });

  it("deduplicates repeated suggested collection IDs", () => {
    // Exercise
    const suggestedId = makeSuggestedCollectionId(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref1: {
              dataType: DataType.DocumentRef,
              collectionId: suggestedId,
            },
            ref2: {
              dataType: DataType.DocumentRef,
              collectionId: suggestedId,
            },
          },
        },
      },
      rootType: "Root",
    };
    const result = extractSuggestedCollectionIds(schema);

    // Verify
    expect(result).toEqual([suggestedId]);
  });

  it("extracts suggested collection IDs from nested Structs", () => {
    // Exercise
    const suggestedId = makeSuggestedCollectionId(0);
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
                  collectionId: suggestedId,
                },
              },
            },
          },
        },
      },
      rootType: "Root",
    };
    const result = extractSuggestedCollectionIds(schema);

    // Verify
    expect(result).toEqual([suggestedId]);
  });

  it("extracts suggested collection IDs from List items", () => {
    // Exercise
    const suggestedId = makeSuggestedCollectionId(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            items: {
              dataType: DataType.List,
              items: {
                dataType: DataType.DocumentRef,
                collectionId: suggestedId,
              },
            },
          },
        },
      },
      rootType: "Root",
    };
    const result = extractSuggestedCollectionIds(schema);

    // Verify
    expect(result).toEqual([suggestedId]);
  });

  it("extracts suggested collection IDs through TypeRef", () => {
    // Exercise
    const suggestedId = makeSuggestedCollectionId(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref: {
              dataType: null,
              ref: "SuggestedRef",
            },
          },
        },
        SuggestedRef: {
          dataType: DataType.DocumentRef,
          collectionId: suggestedId,
        },
      },
      rootType: "Root",
    };
    const result = extractSuggestedCollectionIds(schema);

    // Verify
    expect(result).toEqual([suggestedId]);
  });

  it("extracts from multiple types in schema", () => {
    // Exercise
    const suggestedId0 = makeSuggestedCollectionId(0);
    const suggestedId1 = makeSuggestedCollectionId(1);
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
          collectionId: suggestedId0,
        },
        Type2: {
          dataType: DataType.DocumentRef,
          collectionId: suggestedId1,
        },
      },
      rootType: "Root",
    };
    const result = extractSuggestedCollectionIds(schema);

    // Verify
    expect(result).toHaveLength(2);
    expect(result).toContain(suggestedId0);
    expect(result).toContain(suggestedId1);
  });

  it("ignores regular collection IDs while extracting suggested ones", () => {
    // Exercise
    const suggestedId = makeSuggestedCollectionId(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            suggested: {
              dataType: DataType.DocumentRef,
              collectionId: suggestedId,
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
    const result = extractSuggestedCollectionIds(schema);

    // Verify
    expect(result).toEqual([suggestedId]);
  });
});
