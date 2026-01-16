import { expect, it } from "vitest";
import DataType from "../DataType.js";
import type Schema from "../Schema.js";
import replaceSelfCollectionId, {
  SELF_COLLECTION_ID,
} from "./replaceSelfCollectionId.js";

it("returns unchanged schema with no DocumentRef types", () => {
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

  // Exercise
  const result = replaceSelfCollectionId(schema, "Collection_123");

  // Verify
  expect(result).toEqual(schema);
});

it("returns unchanged schema when DocumentRef has no collectionId", () => {
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

  // Exercise
  const result = replaceSelfCollectionId(schema, "Collection_123");

  // Verify
  expect(result).toEqual(schema);
});

it("returns unchanged schema when DocumentRef has a regular collectionId", () => {
  const schema: Schema = {
    types: {
      Root: {
        dataType: DataType.Struct,
        properties: {
          documentRef: {
            dataType: DataType.DocumentRef,
            collectionId: "Other_Collection",
          },
        },
      },
    },
    rootType: "Root",
  };

  // Exercise
  const result = replaceSelfCollectionId(schema, "Collection_123");

  // Verify
  expect(result).toEqual(schema);
});

it("replaces 'self' with actual collectionId", () => {
  const schema: Schema = {
    types: {
      Root: {
        dataType: DataType.Struct,
        properties: {
          parent: {
            dataType: DataType.DocumentRef,
            collectionId: SELF_COLLECTION_ID,
          },
        },
      },
    },
    rootType: "Root",
  };

  // Exercise
  const result = replaceSelfCollectionId(schema, "Collection_123");

  // Verify
  expect(result).toEqual({
    types: {
      Root: {
        dataType: DataType.Struct,
        properties: {
          parent: {
            dataType: DataType.DocumentRef,
            collectionId: "Collection_123",
          },
        },
      },
    },
    rootType: "Root",
  });
});

it("replaces multiple 'self' references", () => {
  const schema: Schema = {
    types: {
      Root: {
        dataType: DataType.Struct,
        properties: {
          parent: {
            dataType: DataType.DocumentRef,
            collectionId: SELF_COLLECTION_ID,
          },
          sibling: {
            dataType: DataType.DocumentRef,
            collectionId: SELF_COLLECTION_ID,
          },
        },
      },
    },
    rootType: "Root",
  };

  // Exercise
  const result = replaceSelfCollectionId(schema, "Collection_123");

  // Verify
  expect(result.types["Root"]).toEqual({
    dataType: DataType.Struct,
    properties: {
      parent: {
        dataType: DataType.DocumentRef,
        collectionId: "Collection_123",
      },
      sibling: {
        dataType: DataType.DocumentRef,
        collectionId: "Collection_123",
      },
    },
  });
});

it("replaces 'self' but keeps other collectionIds", () => {
  const schema: Schema = {
    types: {
      Root: {
        dataType: DataType.Struct,
        properties: {
          parent: {
            dataType: DataType.DocumentRef,
            collectionId: SELF_COLLECTION_ID,
          },
          relatedTask: {
            dataType: DataType.DocumentRef,
            collectionId: "Collection_456",
          },
        },
      },
    },
    rootType: "Root",
  };

  // Exercise
  const result = replaceSelfCollectionId(schema, "Collection_123");

  // Verify
  expect(result.types["Root"]).toEqual({
    dataType: DataType.Struct,
    properties: {
      parent: {
        dataType: DataType.DocumentRef,
        collectionId: "Collection_123",
      },
      relatedTask: {
        dataType: DataType.DocumentRef,
        collectionId: "Collection_456",
      },
    },
  });
});

it("replaces 'self' in nested Structs", () => {
  const schema: Schema = {
    types: {
      Root: {
        dataType: DataType.Struct,
        properties: {
          nested: {
            dataType: DataType.Struct,
            properties: {
              parent: {
                dataType: DataType.DocumentRef,
                collectionId: SELF_COLLECTION_ID,
              },
            },
          },
        },
      },
    },
    rootType: "Root",
  };

  // Exercise
  const result = replaceSelfCollectionId(schema, "Collection_123");

  // Verify
  expect(result.types["Root"]).toEqual({
    dataType: DataType.Struct,
    properties: {
      nested: {
        dataType: DataType.Struct,
        properties: {
          parent: {
            dataType: DataType.DocumentRef,
            collectionId: "Collection_123",
          },
        },
      },
    },
  });
});

it("replaces 'self' in List items", () => {
  const schema: Schema = {
    types: {
      Root: {
        dataType: DataType.Struct,
        properties: {
          children: {
            dataType: DataType.List,
            items: {
              dataType: DataType.DocumentRef,
              collectionId: SELF_COLLECTION_ID,
            },
          },
        },
      },
    },
    rootType: "Root",
  };

  // Exercise
  const result = replaceSelfCollectionId(schema, "Collection_123");

  // Verify
  expect(result.types["Root"]).toEqual({
    dataType: DataType.Struct,
    properties: {
      children: {
        dataType: DataType.List,
        items: {
          dataType: DataType.DocumentRef,
          collectionId: "Collection_123",
        },
      },
    },
  });
});

it("handles TypeRef (does not recurse into referenced types)", () => {
  const schema: Schema = {
    types: {
      Root: {
        dataType: DataType.Struct,
        properties: {
          parent: {
            dataType: null,
            ref: "SelfRef",
          },
        },
      },
      SelfRef: {
        dataType: DataType.DocumentRef,
        collectionId: SELF_COLLECTION_ID,
      },
    },
    rootType: "Root",
  };

  // Exercise
  const result = replaceSelfCollectionId(schema, "Collection_123");

  // Verify
  // TypeRef itself is unchanged, but the referenced type is also processed
  expect(result.types["Root"]).toEqual({
    dataType: DataType.Struct,
    properties: {
      parent: {
        dataType: null,
        ref: "SelfRef",
      },
    },
  });
  // The referenced type should be replaced
  expect(result.types["SelfRef"]).toEqual({
    dataType: DataType.DocumentRef,
    collectionId: "Collection_123",
  });
});

it("preserves other type definition properties", () => {
  const schema: Schema = {
    types: {
      Root: {
        dataType: DataType.Struct,
        description: "Root type",
        properties: {
          parent: {
            dataType: DataType.DocumentRef,
            description: "Parent document reference",
            collectionId: SELF_COLLECTION_ID,
          },
        },
        nullableProperties: ["parent"],
        propertiesOrder: ["parent"],
      },
    },
    rootType: "Root",
  };

  // Exercise
  const result = replaceSelfCollectionId(schema, "Collection_123");

  // Verify
  expect(result.types["Root"]).toEqual({
    dataType: DataType.Struct,
    description: "Root type",
    properties: {
      parent: {
        dataType: DataType.DocumentRef,
        description: "Parent document reference",
        collectionId: "Collection_123",
      },
    },
    nullableProperties: ["parent"],
    propertiesOrder: ["parent"],
  });
});
