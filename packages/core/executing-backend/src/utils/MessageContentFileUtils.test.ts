import {
  type MessageContentPart,
  MessageContentPartType,
} from "@superego/backend";
import { Id } from "@superego/shared-utils";
import { describe, expect, it } from "vitest";
import MessageContentFileUtils from "./MessageContentFileUtils.js";

describe("extractReferencedFileIds", () => {
  it("extracts FileIds", () => {
    // Exercise
    const messageContent: MessageContentPart[] = [
      {
        type: MessageContentPartType.Text,
        text: "text",
      },
      {
        type: MessageContentPartType.File,
        file: {
          id: "file_0",
          name: "name",
          mimeType: "mimeType",
        },
      },
      {
        type: MessageContentPartType.File,
        file: {
          id: "file_1",
          name: "name",
          mimeType: "mimeType",
        },
      },
    ];
    const extractedFileIds =
      MessageContentFileUtils.extractReferencedFileIds(messageContent);

    // Verify
    expect(extractedFileIds).toEqual(["file_0", "file_1"]);
  });

  it("deduplicates FileIds", () => {
    // Exercise
    const messageContent: MessageContentPart[] = [
      {
        type: MessageContentPartType.File,
        file: {
          id: "file_0",
          name: "name",
          mimeType: "mimeType",
        },
      },
      {
        type: MessageContentPartType.File,
        file: {
          id: "file_0",
          name: "name",
          mimeType: "mimeType",
        },
      },
    ];
    const extractedFileIds =
      MessageContentFileUtils.extractReferencedFileIds(messageContent);

    // Verify
    expect(extractedFileIds).toEqual(["file_0"]);
  });

  it("ignores ProtoFiles", () => {
    // Exercise
    const messageContent: MessageContentPart[] = [
      {
        type: MessageContentPartType.File,
        file: {
          id: "file_0",
          name: "name",
          mimeType: "mimeType",
        },
      },
      {
        type: MessageContentPartType.File,
        file: {
          name: "name",
          mimeType: "mimeType",
          content: new TextEncoder().encode("content"),
        },
      },
    ];
    const extractedFileIds =
      MessageContentFileUtils.extractReferencedFileIds(messageContent);

    // Verify
    expect(extractedFileIds).toEqual(["file_0"]);
  });
});

describe("extractAndConvertProtoFiles", () => {
  it("extracts and converts ProtoFiles", () => {
    // Exercise
    const messageContent: MessageContentPart[] = [
      {
        type: MessageContentPartType.Text,
        text: "text",
      },
      {
        type: MessageContentPartType.File,
        file: {
          name: "name",
          mimeType: "mimeType",
          content: new TextEncoder().encode("content"),
        },
      },
    ];
    const { convertedMessageContent, protoFilesWithIds } =
      MessageContentFileUtils.extractAndConvertProtoFiles(messageContent);

    // Verify
    expect(protoFilesWithIds).toEqual([
      {
        id: expect.toSatisfy(Id.is.file),
        name: "name",
        mimeType: "mimeType",
        content: new TextEncoder().encode("content"),
      },
    ]);
    expect(convertedMessageContent).toEqual([
      {
        type: MessageContentPartType.Text,
        text: "text",
      },
      {
        type: MessageContentPartType.File,
        file: {
          id: protoFilesWithIds[0]!.id,
          name: "name",
          mimeType: "mimeType",
        },
      },
    ]);
  });

  it("ignores FileRefs", () => {
    // Exercise
    const messageContent: MessageContentPart[] = [
      {
        type: MessageContentPartType.File,
        file: {
          name: "name",
          mimeType: "mimeType",
          content: new TextEncoder().encode("content"),
        },
      },
      {
        type: MessageContentPartType.File,
        file: {
          id: "file_0",
          name: "name",
          mimeType: "mimeType",
        },
      },
    ];
    const { convertedMessageContent, protoFilesWithIds } =
      MessageContentFileUtils.extractAndConvertProtoFiles(messageContent);

    // Verify
    expect(protoFilesWithIds).toEqual([
      {
        id: expect.toSatisfy(Id.is.file),
        name: "name",
        mimeType: "mimeType",
        content: new TextEncoder().encode("content"),
      },
    ]);
    expect(convertedMessageContent).toEqual([
      {
        type: MessageContentPartType.File,
        file: {
          id: protoFilesWithIds[0]!.id,
          name: "name",
          mimeType: "mimeType",
        },
      },
      {
        type: MessageContentPartType.File,
        file: {
          id: "file_0",
          name: "name",
          mimeType: "mimeType",
        },
      },
    ]);
  });
});
