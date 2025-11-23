import {
  type FileId,
  type MessageContentPart,
  MessageContentPartType,
} from "@superego/backend";
import type { ProtoFile } from "@superego/schema";
import { Id } from "@superego/shared-utils";

export default {
  /**
   * Goes through the supplied message content extracting the de-duplicated list
   * of all referenced FileIds.
   */
  extractReferencedFileIds(messageContent: MessageContentPart[]): FileId[] {
    const fileIds = new Set<FileId>();
    for (const part of messageContent) {
      if (part.type === MessageContentPartType.File && "id" in part.file) {
        fileIds.add(part.file.id as FileId);
      }
    }
    return Array.from(fileIds);
  },

  /**
   * Goes through the supplied message content searching for parts containing
   * ProtoFiles. When a ProtoFile is found:
   *
   * - An FileId for it is generated.
   * - The ProtoFile and its id are collected into an array.
   * - The ProtoFile in the content part is converted into an FileRef.
   *
   * The function returns:
   *
   * - The list of ProtoFiles with ids.
   * - The converted copy of the passed-in message content. (The passed-in
   *   message content is NOT modified in-place.)
   */
  extractAndConvertProtoFiles(messageContent: MessageContentPart[]): {
    protoFilesWithIds: (ProtoFile & { id: FileId })[];
    convertedMessageContent: MessageContentPart[];
  } {
    const convertedMessageContent = structuredClone(messageContent);
    const protoFileParts = convertedMessageContent.filter(
      (part): part is MessageContentPart.File =>
        part.type === MessageContentPartType.File,
    );
    const protoFilesWithIds: (ProtoFile & { id: FileId })[] = [];
    for (const protoFilePart of protoFileParts) {
      if ("content" in protoFilePart.file) {
        const id: FileId = Id.generate.file();
        protoFilesWithIds.push({ ...protoFilePart.file, id });
        protoFilePart.file = {
          id: id,
          name: protoFilePart.file.name,
          mimeType: protoFilePart.file.mimeType,
        };
      }
    }
    return { convertedMessageContent, protoFilesWithIds };
  },
};
