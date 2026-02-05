import type { DocumentId, ProtoDocumentId } from "@superego/backend";
import { describe, expect, it } from "vitest";
import DataType from "../DataType.js";
import type Schema from "../Schema.js";
import {
  extractProtoDocumentIds,
  isProtoDocumentId,
  makeProtoDocumentId,
  makeProtoDocumentIdMapping,
  parseProtoDocumentIndex,
  replaceProtoDocumentIds,
} from "./protoDocumentIds.js";

describe("makeProtoDocumentId", () => {
  it("returns correct format", () => {
    // Exercise
    const result0 = makeProtoDocumentId(0);
    const result1 = makeProtoDocumentId(1);
    const result42 = makeProtoDocumentId(42);

    // Verify
    expect(result0).toBe("ProtoDocument_0");
    expect(result1).toBe("ProtoDocument_1");
    expect(result42).toBe("ProtoDocument_42");
  });

  it.each([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  ])("roundtrips index %i correctly", (index) => {
    // Exercise + Verify
    const protoId = makeProtoDocumentId(index);
    expect(isProtoDocumentId(protoId)).toBe(true);
    expect(parseProtoDocumentIndex(protoId)).toBe(index);
  });
});

describe("makeProtoDocumentIdMapping", () => {
  it("creates correct mapping from array of actual IDs", () => {
    // Exercise
    const actualIds: DocumentId[] = [
      "Document_abc" as DocumentId,
      "Document_def" as DocumentId,
      "Document_ghi" as DocumentId,
    ];
    const mapping = makeProtoDocumentIdMapping(actualIds);

    // Verify
    expect(mapping.get("ProtoDocument_0")).toBe("Document_abc");
    expect(mapping.get("ProtoDocument_1")).toBe("Document_def");
    expect(mapping.get("ProtoDocument_2")).toBe("Document_ghi");
    expect(mapping.size).toBe(3);
  });

  it("handles empty array", () => {
    // Exercise
    const mapping = makeProtoDocumentIdMapping([]);

    // Verify
    expect(mapping.size).toBe(0);
  });
});

describe("isProtoDocumentId", () => {
  it("returns true for proto document IDs", () => {
    // Exercise + Verify
    expect(isProtoDocumentId("ProtoDocument_0")).toBe(true);
    expect(isProtoDocumentId("ProtoDocument_42")).toBe(true);
  });

  it("returns false for regular document IDs", () => {
    // Exercise + Verify
    expect(isProtoDocumentId("Document_abc")).toBe(false);
    expect(isProtoDocumentId("abc")).toBe(false);
    expect(isProtoDocumentId("ProtoCollection_0")).toBe(false);
  });
});

describe("parseProtoDocumentIndex", () => {
  it("extracts index from proto document ID", () => {
    // Exercise + Verify
    expect(parseProtoDocumentIndex("ProtoDocument_0")).toBe(0);
    expect(parseProtoDocumentIndex("ProtoDocument_42")).toBe(42);
  });

  it("returns null for non-proto document IDs", () => {
    // Exercise + Verify
    expect(parseProtoDocumentIndex("Document_abc")).toBe(null);
    expect(parseProtoDocumentIndex("ProtoCollection_0")).toBe(null);
  });

  it("returns null for invalid index", () => {
    // Exercise + Verify
    expect(parseProtoDocumentIndex("ProtoDocument_-1")).toBe(null);
    expect(parseProtoDocumentIndex("ProtoDocument_abc")).toBe(null);
  });
});

describe("extractProtoDocumentIds", () => {
  it("returns empty array when content has no DocumentRef", () => {
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
    const content = { name: "test" };
    const result = extractProtoDocumentIds(schema, content);

    // Verify
    expect(result).toEqual([]);
  });

  it("returns empty array when DocumentRef has regular document ID", () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref: { dataType: DataType.DocumentRef },
          },
        },
      },
      rootType: "Root",
    };
    const content = {
      ref: { collectionId: "Collection_123", documentId: "Document_456" },
    };
    const result = extractProtoDocumentIds(schema, content);

    // Verify
    expect(result).toEqual([]);
  });

  it("extracts a single proto document ID", () => {
    // Exercise
    const protoId = makeProtoDocumentId(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref: { dataType: DataType.DocumentRef },
          },
        },
      },
      rootType: "Root",
    };
    const content = {
      ref: { collectionId: "Collection_123", documentId: protoId },
    };
    const result = extractProtoDocumentIds(schema, content);

    // Verify
    expect(result).toEqual([protoId]);
  });

  it("extracts multiple different proto document IDs", () => {
    // Exercise
    const protoId0 = makeProtoDocumentId(0);
    const protoId1 = makeProtoDocumentId(1);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref0: { dataType: DataType.DocumentRef },
            ref1: { dataType: DataType.DocumentRef },
          },
        },
      },
      rootType: "Root",
    };
    const content = {
      ref0: { collectionId: "Collection_123", documentId: protoId0 },
      ref1: { collectionId: "Collection_123", documentId: protoId1 },
    };
    const result = extractProtoDocumentIds(schema, content);

    // Verify
    expect(result).toHaveLength(2);
    expect(result).toContain(protoId0);
    expect(result).toContain(protoId1);
  });

  it("deduplicates repeated proto document IDs", () => {
    // Exercise
    const protoId = makeProtoDocumentId(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref1: { dataType: DataType.DocumentRef },
            ref2: { dataType: DataType.DocumentRef },
          },
        },
      },
      rootType: "Root",
    };
    const content = {
      ref1: { collectionId: "Collection_123", documentId: protoId },
      ref2: { collectionId: "Collection_456", documentId: protoId },
    };
    const result = extractProtoDocumentIds(schema, content);

    // Verify
    expect(result).toEqual([protoId]);
  });

  it("extracts proto document IDs from nested Structs", () => {
    // Exercise
    const protoId = makeProtoDocumentId(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nested: {
              dataType: DataType.Struct,
              properties: {
                ref: { dataType: DataType.DocumentRef },
              },
            },
          },
        },
      },
      rootType: "Root",
    };
    const content = {
      nested: {
        ref: { collectionId: "Collection_123", documentId: protoId },
      },
    };
    const result = extractProtoDocumentIds(schema, content);

    // Verify
    expect(result).toEqual([protoId]);
  });

  it("extracts proto document IDs from List items", () => {
    // Exercise
    const protoId = makeProtoDocumentId(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            items: {
              dataType: DataType.List,
              items: { dataType: DataType.DocumentRef },
            },
          },
        },
      },
      rootType: "Root",
    };
    const content = {
      items: [
        { collectionId: "Collection_123", documentId: protoId },
        { collectionId: "Collection_456", documentId: "Document_789" },
      ],
    };
    const result = extractProtoDocumentIds(schema, content);

    // Verify
    expect(result).toEqual([protoId]);
  });

  it("extracts proto document IDs through TypeRef", () => {
    // Exercise
    const protoId = makeProtoDocumentId(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref: {
              dataType: null,
              ref: "MyRef",
            },
          },
        },
        MyRef: {
          dataType: DataType.DocumentRef,
        },
      },
      rootType: "Root",
    };
    const content = {
      ref: { collectionId: "Collection_123", documentId: protoId },
    };
    const result = extractProtoDocumentIds(schema, content);

    // Verify
    expect(result).toEqual([protoId]);
  });

  it("handles null values gracefully", () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref: { dataType: DataType.DocumentRef },
          },
          nullableProperties: ["ref"],
        },
      },
      rootType: "Root",
    };
    const content = { ref: null };
    const result = extractProtoDocumentIds(schema, content);

    // Verify
    expect(result).toEqual([]);
  });
});

describe("replaceProtoDocumentIds", () => {
  it("replaces proto document ID with actual ID", () => {
    // Exercise
    const protoId = makeProtoDocumentId(0);
    const actualId = "Document_abc" as DocumentId;
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref: { dataType: DataType.DocumentRef },
          },
        },
      },
      rootType: "Root",
    };
    const content = {
      ref: { collectionId: "Collection_123", documentId: protoId },
    };
    const idMapping = new Map<ProtoDocumentId, DocumentId>([
      [protoId, actualId],
    ]);
    const result = replaceProtoDocumentIds(schema, content, idMapping);

    // Verify
    expect(result).toEqual({
      ref: { collectionId: "Collection_123", documentId: actualId },
    });
  });

  it("preserves non-proto document IDs", () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref: { dataType: DataType.DocumentRef },
          },
        },
      },
      rootType: "Root",
    };
    const content = {
      ref: { collectionId: "Collection_123", documentId: "Document_456" },
    };
    const idMapping = new Map<ProtoDocumentId, DocumentId>();
    const result = replaceProtoDocumentIds(schema, content, idMapping);

    // Verify
    expect(result).toEqual(content);
  });

  it("replaces proto IDs in nested structures", () => {
    // Exercise
    const protoId = makeProtoDocumentId(0);
    const actualId = "Document_abc" as DocumentId;
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nested: {
              dataType: DataType.Struct,
              properties: {
                ref: { dataType: DataType.DocumentRef },
              },
            },
          },
        },
      },
      rootType: "Root",
    };
    const content = {
      nested: {
        ref: { collectionId: "Collection_123", documentId: protoId },
      },
    };
    const idMapping = new Map<ProtoDocumentId, DocumentId>([
      [protoId, actualId],
    ]);
    const result = replaceProtoDocumentIds(schema, content, idMapping);

    // Verify
    expect(result).toEqual({
      nested: {
        ref: { collectionId: "Collection_123", documentId: actualId },
      },
    });
  });

  it("replaces proto IDs in List items", () => {
    // Exercise
    const protoId0 = makeProtoDocumentId(0);
    const protoId1 = makeProtoDocumentId(1);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            items: {
              dataType: DataType.List,
              items: { dataType: DataType.DocumentRef },
            },
          },
        },
      },
      rootType: "Root",
    };
    const content = {
      items: [
        { collectionId: "Collection_123", documentId: protoId0 },
        { collectionId: "Collection_456", documentId: protoId1 },
      ],
    };
    const idMapping = new Map<ProtoDocumentId, DocumentId>([
      [protoId0, "Document_abc" as DocumentId],
      [protoId1, "Document_def" as DocumentId],
    ]);
    const result = replaceProtoDocumentIds(schema, content, idMapping);

    // Verify
    expect(result).toEqual({
      items: [
        { collectionId: "Collection_123", documentId: "Document_abc" },
        { collectionId: "Collection_456", documentId: "Document_def" },
      ],
    });
  });

  it("handles mixed proto and regular IDs", () => {
    // Exercise
    const protoId = makeProtoDocumentId(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            protoRef: { dataType: DataType.DocumentRef },
            regularRef: { dataType: DataType.DocumentRef },
          },
        },
      },
      rootType: "Root",
    };
    const content = {
      protoRef: { collectionId: "Collection_123", documentId: protoId },
      regularRef: {
        collectionId: "Collection_456",
        documentId: "Document_789",
      },
    };
    const idMapping = new Map<ProtoDocumentId, DocumentId>([
      [protoId, "Document_abc" as DocumentId],
    ]);
    const result = replaceProtoDocumentIds(schema, content, idMapping);

    // Verify
    expect(result).toEqual({
      protoRef: { collectionId: "Collection_123", documentId: "Document_abc" },
      regularRef: {
        collectionId: "Collection_456",
        documentId: "Document_789",
      },
    });
  });

  it("handles null values gracefully", () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref: { dataType: DataType.DocumentRef },
          },
          nullableProperties: ["ref"],
        },
      },
      rootType: "Root",
    };
    const content = { ref: null };
    const idMapping = new Map<ProtoDocumentId, DocumentId>();
    const result = replaceProtoDocumentIds(schema, content, idMapping);

    // Verify
    expect(result).toEqual({ ref: null });
  });

  it("preserves other properties in content", () => {
    // Exercise
    const protoId = makeProtoDocumentId(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            name: { dataType: DataType.String },
            ref: { dataType: DataType.DocumentRef },
          },
        },
      },
      rootType: "Root",
    };
    const content = {
      name: "test",
      ref: { collectionId: "Collection_123", documentId: protoId },
    };
    const idMapping = new Map<ProtoDocumentId, DocumentId>([
      [protoId, "Document_abc" as DocumentId],
    ]);
    const result = replaceProtoDocumentIds(schema, content, idMapping);

    // Verify
    expect(result).toEqual({
      name: "test",
      ref: { collectionId: "Collection_123", documentId: "Document_abc" },
    });
  });
});
