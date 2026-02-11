import type {
  AppId,
  CollectionCategoryId,
  CollectionId,
  DocumentId,
} from "@superego/backend";
import { DataType, type Schema } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { describe, expect, it } from "vitest";
import {
  extractProtoCollectionIds,
  extractProtoDocumentIds,
  makeProtoAppIdMapping,
  makeProtoCollectionCategoryIdMapping,
  makeProtoCollectionIdMapping,
  makeProtoDocumentIdMapping,
  replaceProtoAppId,
  replaceProtoCollectionCategoryId,
  replaceProtoCollectionIds,
  replaceProtoDocumentIdsAndProtoCollectionIds,
} from "./ProtoIdUtils.js";

describe("makeProtoCollectionCategoryIdMapping", () => {
  it("creates correct mapping from array of collection category IDs", () => {
    // Exercise
    const collectionCategoryIds: CollectionCategoryId[] = [
      Id.generate.collectionCategory(),
      Id.generate.collectionCategory(),
      Id.generate.collectionCategory(),
    ];
    const mapping = makeProtoCollectionCategoryIdMapping(collectionCategoryIds);

    // Verify
    expect(mapping.get("ProtoCollectionCategory_0")).toBe(
      collectionCategoryIds[0],
    );
    expect(mapping.get("ProtoCollectionCategory_1")).toBe(
      collectionCategoryIds[1],
    );
    expect(mapping.get("ProtoCollectionCategory_2")).toBe(
      collectionCategoryIds[2],
    );
    expect(mapping.size).toBe(3);
  });

  it("handles empty array", () => {
    // Exercise
    const mapping = makeProtoCollectionCategoryIdMapping([]);

    // Verify
    expect(mapping.size).toBe(0);
  });
});

describe("replaceProtoCollectionCategoryId", () => {
  it("replaces proto collection category ID with actual ID from mapping", () => {
    // Setup SUT
    const protoCollectionCategoryId = Id.generate.protoCollectionCategory(0);
    const collectionCategoryId = Id.generate.collectionCategory();
    const idMapping = new Map([
      [protoCollectionCategoryId, collectionCategoryId],
    ]);

    // Exercise
    const result = replaceProtoCollectionCategoryId(
      protoCollectionCategoryId,
      idMapping,
    );

    // Verify
    expect(result).toBe(collectionCategoryId);
  });

  it("returns original ID if not a proto ID", () => {
    // Setup SUT
    const collectionCategoryId = Id.generate.collectionCategory();
    const idMapping = new Map<string, CollectionCategoryId>();

    // Exercise
    const result = replaceProtoCollectionCategoryId(
      collectionCategoryId,
      idMapping as any,
    );

    // Verify
    expect(result).toBe(collectionCategoryId);
  });

  it("returns original ID if proto ID not found in mapping", () => {
    // Setup SUT
    const protoCollectionCategoryId = Id.generate.protoCollectionCategory(0);
    const idMapping = new Map<string, CollectionCategoryId>();

    // Exercise
    const result = replaceProtoCollectionCategoryId(
      protoCollectionCategoryId,
      idMapping as any,
    );

    // Verify
    expect(result).toBe(protoCollectionCategoryId);
  });

  it("handles null input", () => {
    // Setup SUT
    const idMapping = new Map<string, CollectionCategoryId>();

    // Exercise
    const result = replaceProtoCollectionCategoryId(null, idMapping as any);

    // Verify
    expect(result).toBeNull();
  });
});

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

describe("replaceProtoDocumentIdsAndProtoCollectionIds", () => {
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
    const result = replaceProtoDocumentIdsAndProtoCollectionIds(
      schema,
      content,
      idMapping,
    );

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
    const result = replaceProtoDocumentIdsAndProtoCollectionIds(
      schema,
      content,
      idMapping as any,
    );

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
    const result = replaceProtoDocumentIdsAndProtoCollectionIds(
      schema,
      content,
      idMapping,
    );

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
    const result = replaceProtoDocumentIdsAndProtoCollectionIds(
      schema,
      content,
      idMapping,
    );

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
    const result = replaceProtoDocumentIdsAndProtoCollectionIds(
      schema,
      content,
      idMapping,
    );

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
    const result = replaceProtoDocumentIdsAndProtoCollectionIds(
      schema,
      content,
      idMapping as any,
    );

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
    const result = replaceProtoDocumentIdsAndProtoCollectionIds(
      schema,
      content,
      idMapping,
    );

    // Verify
    expect(result).toEqual({
      name: "test",
      ref: { collectionId, documentId },
    });
  });
});

describe("makeProtoAppIdMapping", () => {
  it("creates correct mapping from array of app IDs", () => {
    // Exercise
    const appIds: AppId[] = [
      Id.generate.app(),
      Id.generate.app(),
      Id.generate.app(),
    ];
    const mapping = makeProtoAppIdMapping(appIds);

    // Verify
    expect(mapping.get("ProtoApp_0")).toBe(appIds[0]);
    expect(mapping.get("ProtoApp_1")).toBe(appIds[1]);
    expect(mapping.get("ProtoApp_2")).toBe(appIds[2]);
    expect(mapping.size).toBe(3);
  });

  it("handles empty array", () => {
    // Exercise
    const mapping = makeProtoAppIdMapping([]);

    // Verify
    expect(mapping.size).toBe(0);
  });
});

describe("replaceProtoAppId", () => {
  it("replaces proto app ID with actual ID from mapping", () => {
    // Setup SUT
    const protoAppId = Id.generate.protoApp(0);
    const appId = Id.generate.app();
    const idMapping = new Map([[protoAppId, appId]]);

    // Exercise
    const result = replaceProtoAppId(protoAppId, idMapping);

    // Verify
    expect(result).toBe(appId);
  });

  it("returns original ID if not a proto ID", () => {
    // Setup SUT
    const appId = Id.generate.app();
    const idMapping = new Map<string, AppId>();

    // Exercise
    const result = replaceProtoAppId(appId, idMapping as any);

    // Verify
    expect(result).toBe(appId);
  });

  it("returns original ID if proto ID not found in mapping", () => {
    // Setup SUT
    const protoAppId = Id.generate.protoApp(0);
    const idMapping = new Map<string, AppId>();

    // Exercise
    const result = replaceProtoAppId(protoAppId, idMapping as any);

    // Verify
    expect(result).toBe(protoAppId);
  });

  it("handles null input", () => {
    // Setup SUT
    const idMapping = new Map<string, AppId>();

    // Exercise
    const result = replaceProtoAppId(null, idMapping as any);

    // Verify
    expect(result).toBeNull();
  });
});
