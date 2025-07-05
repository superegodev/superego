import { DataType, type Schema } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import { describe, expect, it } from "vitest";
import ContentFileUtils from "./ContentFileUtils.js";

describe("extractReferencedFileIds", () => {
  it("extracts FileIds", () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nonNullableFile0: {
              dataType: DataType.File,
            },
            nonNullableFile1: {
              dataType: DataType.File,
            },
          },
        },
      },
      rootType: "Root",
    };
    const content = {
      nonNullableFile0: {
        id: "file_0",
        name: "name",
        mimeType: "mimeType",
        size: 0,
      },
      nonNullableFile1: {
        id: "file_1",
        name: "name",
        mimeType: "mimeType",
        size: 0,
      },
    };
    const extractedFileIds = ContentFileUtils.extractReferencedFileIds(
      schema,
      content,
    );

    // Verify
    expect(extractedFileIds).toEqual(["file_0", "file_1"]);
  });

  it("deduplicates FileIds", () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nonNullableFile0: {
              dataType: DataType.File,
            },
            nonNullableFile1: {
              dataType: DataType.File,
            },
          },
        },
      },
      rootType: "Root",
    };
    const content = {
      nonNullableFile0: {
        id: "file_0",
        name: "name",
        mimeType: "mimeType",
        size: 0,
      },
      nonNullableFile1: {
        id: "file_0",
        name: "name",
        mimeType: "mimeType",
        size: 0,
      },
    };
    const extractedFileIds = ContentFileUtils.extractReferencedFileIds(
      schema,
      content,
    );

    // Verify
    expect(extractedFileIds).toEqual(["file_0"]);
  });

  it("ignores ProtoFile nodes", () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nonNullableFile0: {
              dataType: DataType.File,
            },
            nonNullableFile1: {
              dataType: DataType.File,
            },
          },
        },
      },
      rootType: "Root",
    };
    const content = {
      nonNullableFile0: {
        id: "file_0",
        name: "name",
        mimeType: "mimeType",
        size: 0,
      },
      nonNullableFile1: {
        name: "name",
        mimeType: "mimeType",
        content: new TextEncoder().encode("content"),
      },
    };
    const extractedFileIds = ContentFileUtils.extractReferencedFileIds(
      schema,
      content,
    );

    // Verify
    expect(extractedFileIds).toEqual(["file_0"]);
  });
});

describe("extractAndConvertProtoFiles", () => {
  it("extracts and converts ProtoFiles", async () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nonNullableFile: {
              dataType: DataType.File,
            },
          },
        },
      },
      rootType: "Root",
    };
    const content = {
      nonNullableFile: {
        name: "name",
        mimeType: "mimeType",
        content: new TextEncoder().encode("content"),
      },
    };
    const { convertedContent, protoFilesWithIds } =
      await ContentFileUtils.extractAndConvertProtoFiles(schema, content);

    // Verify
    expect(protoFilesWithIds).toEqual([
      {
        id: expect.toSatisfy(Id.is.file),
        name: "name",
        mimeType: "mimeType",
        content: new TextEncoder().encode("content"),
      },
    ]);

    expect(convertedContent).toEqual({
      nonNullableFile: {
        id: protoFilesWithIds[0]!.id,
        name: "name",
        mimeType: "mimeType",
      },
    });
  });

  it("ignores FileRefs", async () => {
    // Exercise
    const schema: Schema = {
      types: {
        Root: {
          dataType: DataType.Struct,
          properties: {
            nonNullableFile0: {
              dataType: DataType.File,
            },
            nonNullableFile1: {
              dataType: DataType.File,
            },
          },
        },
      },
      rootType: "Root",
    };
    const content = {
      nonNullableFile0: {
        name: "name",
        mimeType: "mimeType",
        content: new TextEncoder().encode("content"),
      },
      nonNullableFile1: {
        id: "file_0",
        name: "name",
        mimeType: "mimeType",
      },
    };
    const { convertedContent, protoFilesWithIds } =
      await ContentFileUtils.extractAndConvertProtoFiles(schema, content);

    // Verify
    expect(protoFilesWithIds).toEqual([
      {
        id: expect.toSatisfy(Id.is.file),
        name: "name",
        mimeType: "mimeType",
        content: new TextEncoder().encode("content"),
      },
    ]);
    expect(convertedContent).toEqual({
      nonNullableFile0: {
        id: protoFilesWithIds[0]!.id,
        name: "name",
        mimeType: "mimeType",
      },
      nonNullableFile1: {
        id: "file_0",
        name: "name",
        mimeType: "mimeType",
      },
    });
  });
});
