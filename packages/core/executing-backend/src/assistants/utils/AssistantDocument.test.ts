import type { Document } from "@superego/backend";
import { DataType, FormatId, type Schema } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { describe, expect, it } from "vitest";
import {
  fromAssistantContent,
  toAssistantDocument,
} from "./AssistantDocument.js";

describe("toAssistantDocument", () => {
  it("converts a Document into an AssistantDocument", () => {
    // Exercise
    const schema: Schema = {
      types: {
        Instant: {
          dataType: DataType.String,
          format: FormatId.String.Instant,
        },
        Enum: {
          dataType: DataType.Enum,
          members: { A: { value: "A" }, B: { value: "B" } },
        },
        RootType: {
          dataType: DataType.Struct,
          properties: {
            string: { dataType: DataType.String },
            wintertimeInstant: {
              dataType: DataType.String,
              format: FormatId.String.Instant,
            },
            summertimeInstant: {
              dataType: DataType.String,
              format: FormatId.String.Instant,
            },
            instantRef: { dataType: null, ref: "Instant" },
            plainDate: {
              dataType: DataType.String,
              format: FormatId.String.PlainDate,
            },
            number: { dataType: DataType.Number },
            enum: { dataType: null, ref: "Enum" },
            file: { dataType: DataType.File },
            struct: {
              dataType: DataType.Struct,
              properties: {
                instant: {
                  dataType: DataType.String,
                  format: FormatId.String.Instant,
                },
              },
            },
            list: {
              dataType: DataType.List,
              items: {
                dataType: DataType.String,
                format: FormatId.String.Instant,
              },
            },
          },
        },
      },
      rootType: "RootType",
    };
    const document: Document = {
      id: Id.generate.document(),
      collectionId: Id.generate.collection(),
      latestVersion: {
        id: Id.generate.documentVersion(),
        collectionVersionId: Id.generate.collectionVersion(),
        previousVersionId: null,
        content: {
          string: "string",
          wintertimeInstant: "2025-01-01T00:00:00.000Z",
          summertimeInstant: "2025-07-01T00:00:00.000Z",
          instantRef: "2025-01-01T00:00:00.000Z",
          plainDate: "2025-01-01",
          number: 0,
          enum: "A",
          file: {
            id: Id.generate.file(),
            name: "name",
            mimeType: "mimeType",
          },
          struct: {
            instant: "2025-01-01T00:00:00.000Z",
          },
          list: ["2025-01-01T00:00:00.000Z"],
        },
        summaryProperties: [
          { name: "name", value: "value", valueComputationError: null },
        ],
        createdAt: new Date(),
      },
      createdAt: new Date(),
    };
    const assistantDocument = toAssistantDocument(
      schema,
      document,
      "Europe/Vilnius",
    );

    // Verify
    expect(assistantDocument).toEqual({
      id: document.id,
      versionId: document.latestVersion.id,
      content: {
        enum: "A",
        file: {
          id: expect.stringMatching("File_"),
          mimeType: "mimeType",
          name: "name",
        },
        wintertimeInstant: "2025-01-01T02:00:00.000+02:00",
        summertimeInstant: "2025-07-01T03:00:00.000+03:00",
        instantRef: "2025-01-01T02:00:00.000+02:00",
        list: ["2025-01-01T02:00:00.000+02:00"],
        number: 0,
        plainDate: "2025-01-01",
        string: "string",
        struct: {
          instant: "2025-01-01T02:00:00.000+02:00",
        },
      },
    });
  });
});

describe("fromAssistantContent", () => {
  describe("converts an AssistantDocument content into a Document content", () => {
    describe("converts undefined -> null", () => {
      const schema: Schema = {
        types: {
          String: { dataType: DataType.String },
          RootType: {
            dataType: DataType.Struct,
            properties: {
              primitive: { dataType: DataType.String },
              nullablePrimitive: { dataType: DataType.String },
              ref: { dataType: null, ref: "String" },
              nullableRef: { dataType: null, ref: "String" },
              struct: {
                dataType: DataType.Struct,
                properties: {
                  nullablePrimitive: { dataType: DataType.String },
                },
                nullableProperties: ["nullablePrimitive"],
              },
              nullableStruct: {
                dataType: DataType.Struct,
                properties: {
                  primitive: { dataType: DataType.String },
                },
              },
              list: {
                dataType: DataType.List,
                items: { dataType: DataType.String },
              },
              nullableList: {
                dataType: DataType.List,
                items: { dataType: DataType.String },
              },
            },
            nullableProperties: [
              "nullablePrimitive",
              "nullableRef",
              "nullableStruct",
              "nullableList",
            ],
          },
        },
        rootType: "RootType",
      };

      it("case: undefined & nullable -> null", () => {
        // Exercise
        const assistantContent = {
          nullablePrimitive: undefined,
          nullableRef: undefined,
          nullableStruct: undefined,
          struct: { nullablePrimitive: undefined },
          nullableList: undefined,
        };
        const documentContent = fromAssistantContent(schema, assistantContent);

        // Verify
        expect(documentContent).toEqual({
          nullablePrimitive: null,
          nullableRef: null,
          nullableStruct: null,
          struct: { nullablePrimitive: null },
          nullableList: null,
        });
      });

      it("case: undefined & not nullable -> undefined", () => {
        // Exercise
        const assistantContent = {
          primitive: undefined,
          ref: undefined,
          struct: undefined,
          nullableStruct: {
            primitive: undefined,
          },
          list: undefined,
        };
        const documentContent = fromAssistantContent(schema, assistantContent);

        // Verify
        expect(documentContent).toEqual({
          primitive: undefined,
          ref: undefined,
          struct: undefined,
          nullableStruct: { primitive: undefined },
          list: undefined,
        });
      });

      it("case: null & nullable -> null", () => {
        // Exercise
        const assistantContent = {
          nullablePrimitive: null,
          nullableRef: null,
          nullableStruct: null,
          struct: { nullablePrimitive: null },
          nullableList: null,
        };
        const documentContent = fromAssistantContent(schema, assistantContent);

        // Verify
        expect(documentContent).toEqual({
          nullablePrimitive: null,
          nullableRef: null,
          nullableStruct: null,
          struct: { nullablePrimitive: null },
          nullableList: null,
        });
      });

      it("case: non-null & nullable -> null", () => {
        const assistantContent = {
          nullablePrimitive: "nullablePrimitive",
          nullableRef: "nullableRef",
          nullableStruct: {},
          struct: { nullablePrimitive: "nullablePrimitive" },
          nullableList: [],
        };
        const documentContent = fromAssistantContent(schema, assistantContent);

        // Verify
        expect(documentContent).toEqual({
          nullablePrimitive: "nullablePrimitive",
          nullableRef: "nullableRef",
          nullableStruct: {},
          struct: { nullablePrimitive: "nullablePrimitive" },
          nullableList: [],
        });
      });
    });

    it("preserves incorrect types or superfluous properties", () => {
      // Exercise
      const schema: Schema = {
        types: {
          RootType: {
            dataType: DataType.Struct,
            properties: {
              string: { dataType: DataType.String },
              number: { dataType: DataType.Number },
            },
          },
        },
        rootType: "RootType",
      };
      const assistantContent = {
        string: "string",
        number: "string",
        boolean: true,
      };
      const documentContent = fromAssistantContent(schema, assistantContent);

      // Verify
      expect(documentContent).toEqual({
        string: "string",
        number: "string",
        boolean: true,
      });
    });

    it("converts Instants to UTC", () => {
      // Exercise
      const schema: Schema = {
        types: {
          Instant: {
            dataType: DataType.String,
            format: FormatId.String.Instant,
          },
          RootType: {
            dataType: DataType.Struct,
            properties: {
              wintertimeInstant: {
                dataType: DataType.String,
                format: FormatId.String.Instant,
              },
              summertimeInstant: {
                dataType: DataType.String,
                format: FormatId.String.Instant,
              },
              instantRef: { dataType: null, ref: "Instant" },
              struct: {
                dataType: DataType.Struct,
                properties: {
                  instant: {
                    dataType: DataType.String,
                    format: FormatId.String.Instant,
                  },
                },
              },
              list: {
                dataType: DataType.List,
                items: {
                  dataType: DataType.String,
                  format: FormatId.String.Instant,
                },
              },
            },
          },
        },
        rootType: "RootType",
      };
      const assistantContent = {
        wintertimeInstant: "2025-01-01T02:00:00.000+02:00",
        summertimeInstant: "2025-07-01T03:00:00.000+03:00",
        instantRef: "2025-01-01T02:00:00.000+02:00",
        struct: { instant: "2025-01-01T02:00:00.000+02:00" },
        list: ["2025-01-01T02:00:00.000+02:00"],
      };
      const documentContent = fromAssistantContent(schema, assistantContent);

      // Verify
      expect(documentContent).toEqual({
        wintertimeInstant: "2025-01-01T00:00:00.000Z",
        summertimeInstant: "2025-07-01T00:00:00.000Z",
        instantRef: "2025-01-01T00:00:00.000Z",
        struct: { instant: "2025-01-01T00:00:00.000Z" },
        list: ["2025-01-01T00:00:00.000Z"],
      });
    });
  });
});
