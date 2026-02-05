import type { DocumentId } from "@superego/backend";
import { DataType, type Schema } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { describe, expect, it } from "vitest";
import {
  extractProtoDocumentIds,
  makeProtoDocumentIdMapping,
  replaceProtoDocumentIds,
} from "./ProtoDocumentIdUtils.js";

describe("makeProtoDocumentIdMapping", () => {
  it("creates correct mapping from array of document IDs", () => {
    // Exercise
    const documentIds: DocumentId[] = [
      Id.generate.document(),
      Id.generate.document(),
      Id.generate.document(),
    ];
    const mapping = makeProtoDocumentIdMapping(documentIds);

    // Verify
    expect(mapping.get("ProtoDocument_0")).toBe(documentIds[0]);
    expect(mapping.get("ProtoDocument_1")).toBe(documentIds[1]);
    expect(mapping.get("ProtoDocument_2")).toBe(documentIds[2]);
    expect(mapping.size).toBe(3);
  });

  it("handles empty array", () => {
    // Exercise
    const mapping = makeProtoDocumentIdMapping([]);

    // Verify
    expect(mapping.size).toBe(0);
  });
});

describe("extractProtoDocumentIds", () => {
  it("returns empty set when content has no DocumentRef", () => {
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
    expect(result.size).toBe(0);
  });

  it("returns empty set when DocumentRef has regular document ID", () => {
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
      ref: {
        collectionId: Id.generate.collection(),
        documentId: Id.generate.document(),
      },
    };
    const result = extractProtoDocumentIds(schema, content);

    // Verify
    expect(result.size).toBe(0);
  });

  it("extracts a single proto document ID", () => {
    // Exercise
    const protoDocumentId = Id.generate.protoDocument(0);
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
      ref: {
        collectionId: Id.generate.collection(),
        documentId: protoDocumentId,
      },
    };
    const result = extractProtoDocumentIds(schema, content);

    // Verify
    expect(result.size).toBe(1);
    expect(result.has(protoDocumentId)).toBe(true);
  });

  it("extracts multiple different proto document IDs", () => {
    // Exercise
    const protoDocumentId0 = Id.generate.protoDocument(0);
    const protoDocumentId1 = Id.generate.protoDocument(1);
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
      ref0: {
        collectionId: Id.generate.collection(),
        documentId: protoDocumentId0,
      },
      ref1: {
        collectionId: Id.generate.collection(),
        documentId: protoDocumentId1,
      },
    };
    const result = extractProtoDocumentIds(schema, content);

    // Verify
    expect(result.size).toBe(2);
    expect(result.has(protoDocumentId0)).toBe(true);
    expect(result.has(protoDocumentId1)).toBe(true);
  });

  it("deduplicates repeated proto document IDs", () => {
    // Exercise
    const protoDocumentId = Id.generate.protoDocument(0);
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
      ref1: {
        collectionId: Id.generate.collection(),
        documentId: protoDocumentId,
      },
      ref2: {
        collectionId: Id.generate.collection(),
        documentId: protoDocumentId,
      },
    };
    const result = extractProtoDocumentIds(schema, content);

    // Verify
    expect(result.size).toBe(1);
    expect(result.has(protoDocumentId)).toBe(true);
  });

  it("extracts proto document IDs from nested Structs", () => {
    // Exercise
    const protoDocumentId = Id.generate.protoDocument(0);
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
        ref: {
          collectionId: Id.generate.collection(),
          documentId: protoDocumentId,
        },
      },
    };
    const result = extractProtoDocumentIds(schema, content);

    // Verify
    expect(result.size).toBe(1);
    expect(result.has(protoDocumentId)).toBe(true);
  });

  it("extracts proto document IDs from List items", () => {
    // Exercise
    const protoDocumentId = Id.generate.protoDocument(0);
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
        { collectionId: Id.generate.collection(), documentId: protoDocumentId },
        {
          collectionId: Id.generate.collection(),
          documentId: Id.generate.document(),
        },
      ],
    };
    const result = extractProtoDocumentIds(schema, content);

    // Verify
    expect(result.size).toBe(1);
    expect(result.has(protoDocumentId)).toBe(true);
  });

  it("extracts proto document IDs through TypeRef", () => {
    // Exercise
    const protoDocumentId = Id.generate.protoDocument(0);
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            ref: {
              dataType: null as any,
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
      ref: {
        collectionId: Id.generate.collection(),
        documentId: protoDocumentId,
      },
    };
    const result = extractProtoDocumentIds(schema, content);

    // Verify
    expect(result.size).toBe(1);
    expect(result.has(protoDocumentId)).toBe(true);
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
    expect(result.size).toBe(0);
  });
});

describe("replaceProtoDocumentIds", () => {
  it("replaces proto document ID with document ID", () => {
    // Exercise
    const protoDocumentId = Id.generate.protoDocument(0);
    const documentId = Id.generate.document();
    const collectionId = Id.generate.collection();
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
      ref: { collectionId, documentId: protoDocumentId },
    };
    const idMapping = new Map([[protoDocumentId, documentId]]);
    const result = replaceProtoDocumentIds(schema, content, idMapping);

    // Verify
    expect(result).toEqual({
      ref: { collectionId, documentId },
    });
  });

  it("preserves non-proto document IDs", () => {
    // Exercise
    const collectionId = Id.generate.collection();
    const documentId = Id.generate.document();
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
      ref: { collectionId, documentId },
    };
    const idMapping = new Map<string, string>();
    const result = replaceProtoDocumentIds(schema, content, idMapping as any);

    // Verify
    expect(result).toEqual(content);
  });

  it("replaces proto IDs in nested structures", () => {
    // Exercise
    const protoDocumentId = Id.generate.protoDocument(0);
    const documentId = Id.generate.document();
    const collectionId = Id.generate.collection();
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
        ref: { collectionId, documentId: protoDocumentId },
      },
    };
    const idMapping = new Map([[protoDocumentId, documentId]]);
    const result = replaceProtoDocumentIds(schema, content, idMapping);

    // Verify
    expect(result).toEqual({
      nested: {
        ref: { collectionId, documentId },
      },
    });
  });

  it("replaces proto IDs in List items", () => {
    // Exercise
    const protoDocumentId0 = Id.generate.protoDocument(0);
    const protoDocumentId1 = Id.generate.protoDocument(1);
    const documentId0 = Id.generate.document();
    const documentId1 = Id.generate.document();
    const collectionId0 = Id.generate.collection();
    const collectionId1 = Id.generate.collection();
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
        { collectionId: collectionId0, documentId: protoDocumentId0 },
        { collectionId: collectionId1, documentId: protoDocumentId1 },
      ],
    };
    const idMapping = new Map([
      [protoDocumentId0, documentId0],
      [protoDocumentId1, documentId1],
    ]);
    const result = replaceProtoDocumentIds(schema, content, idMapping);

    // Verify
    expect(result).toEqual({
      items: [
        { collectionId: collectionId0, documentId: documentId0 },
        { collectionId: collectionId1, documentId: documentId1 },
      ],
    });
  });

  it("handles mixed proto and regular IDs", () => {
    // Exercise
    const protoDocumentId = Id.generate.protoDocument(0);
    const documentId = Id.generate.document();
    const regularDocumentId = Id.generate.document();
    const collectionId0 = Id.generate.collection();
    const collectionId1 = Id.generate.collection();
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
      protoRef: { collectionId: collectionId0, documentId: protoDocumentId },
      regularRef: {
        collectionId: collectionId1,
        documentId: regularDocumentId,
      },
    };
    const idMapping = new Map([[protoDocumentId, documentId]]);
    const result = replaceProtoDocumentIds(schema, content, idMapping);

    // Verify
    expect(result).toEqual({
      protoRef: { collectionId: collectionId0, documentId },
      regularRef: {
        collectionId: collectionId1,
        documentId: regularDocumentId,
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
    const idMapping = new Map<string, string>();
    const result = replaceProtoDocumentIds(schema, content, idMapping as any);

    // Verify
    expect(result).toEqual({ ref: null });
  });

  it("preserves other properties in content", () => {
    // Exercise
    const protoDocumentId = Id.generate.protoDocument(0);
    const documentId = Id.generate.document();
    const collectionId = Id.generate.collection();
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
      ref: { collectionId, documentId: protoDocumentId },
    };
    const idMapping = new Map([[protoDocumentId, documentId]]);
    const result = replaceProtoDocumentIds(schema, content, idMapping);

    // Verify
    expect(result).toEqual({
      name: "test",
      ref: { collectionId, documentId },
    });
  });
});
