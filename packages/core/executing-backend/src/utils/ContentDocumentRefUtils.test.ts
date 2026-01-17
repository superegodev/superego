import { DataType, type Schema } from "@superego/schema";
import { describe, expect, it } from "vitest";
import ContentDocumentRefUtils from "./ContentDocumentRefUtils.js";

describe("extractDocumentRefs", () => {
  it("returns empty array for content with no DocumentRefs", () => {
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

    const result = ContentDocumentRefUtils.extractDocumentRefs(schema, content);

    expect(result).toEqual([]);
  });

  it("extracts DocumentRefs", () => {
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
        collectionId: "Collection_0",
        documentId: "Document_0",
      },
      ref1: {
        collectionId: "Collection_1",
        documentId: "Document_1",
      },
    };

    const result = ContentDocumentRefUtils.extractDocumentRefs(schema, content);

    expect(result).toEqual([
      { collectionId: "Collection_0", documentId: "Document_0" },
      { collectionId: "Collection_1", documentId: "Document_1" },
    ]);
  });

  it("deduplicates DocumentRefs", () => {
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
        collectionId: "Collection_0",
        documentId: "Document_0",
      },
      ref1: {
        collectionId: "Collection_0",
        documentId: "Document_0",
      },
    };

    const result = ContentDocumentRefUtils.extractDocumentRefs(schema, content);

    expect(result).toEqual([
      { collectionId: "Collection_0", documentId: "Document_0" },
    ]);
  });

  it("extracts DocumentRefs from nested structures", () => {
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
          collectionId: "Collection_0",
          documentId: "Document_0",
        },
      },
    };

    const result = ContentDocumentRefUtils.extractDocumentRefs(schema, content);

    expect(result).toEqual([
      { collectionId: "Collection_0", documentId: "Document_0" },
    ]);
  });

  it("extracts DocumentRefs from lists", () => {
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            refs: {
              dataType: DataType.List,
              items: { dataType: DataType.DocumentRef },
            },
          },
        },
      },
      rootType: "Root",
    };
    const content = {
      refs: [
        { collectionId: "Collection_0", documentId: "Document_0" },
        { collectionId: "Collection_1", documentId: "Document_1" },
      ],
    };

    const result = ContentDocumentRefUtils.extractDocumentRefs(schema, content);

    expect(result).toEqual([
      { collectionId: "Collection_0", documentId: "Document_0" },
      { collectionId: "Collection_1", documentId: "Document_1" },
    ]);
  });

  it("handles null DocumentRef values", () => {
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
    const content = {
      ref: null,
    };

    const result = ContentDocumentRefUtils.extractDocumentRefs(schema, content);

    expect(result).toEqual([]);
  });
});
