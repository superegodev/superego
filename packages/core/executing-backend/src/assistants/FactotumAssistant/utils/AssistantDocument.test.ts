import { type Document, DocumentVersionCreator } from "@superego/backend";
import { DataType, FormatId, type Schema } from "@superego/schema";
import { Id, makeSuccessfulResult } from "@superego/shared-utils";
import { describe, expect, it } from "vitest";
import { toAssistantDocument } from "./AssistantDocument.js";

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
      remoteId: null,
      remoteUrl: null,
      collectionId: Id.generate.collection(),
      latestVersion: {
        id: Id.generate.documentVersion(),
        remoteId: null,
        collectionVersionId: Id.generate.collectionVersion(),
        previousVersionId: null,
        conversationId: null,
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
        contentSummary: makeSuccessfulResult({}),
        createdBy: DocumentVersionCreator.User,
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
