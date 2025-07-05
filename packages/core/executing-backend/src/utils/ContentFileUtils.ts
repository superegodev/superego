import type { FileId } from "@superego/backend";
import type { FileRef, ProtoFile, Schema } from "@superego/schema";
import { Id } from "@superego/shared-utils";
import findFileNodes from "./findFileNodes.js";
import replaceValueAtPath from "./replaceValueAtPath.js";

export default {
  /**
   * Goes through the supplied content struct - assumed to be abide by the
   * passed-in schema - extracting the de-duplicated list of all FileIds
   * referenced in it.
   *
   * Note: the process does NOT extract FileIds that might be inside JsonObject
   * nodes or in String nodes.
   */
  extractReferencedFileIds(schema: Schema, content: any): FileId[] {
    const fileNodes = findFileNodes(schema, content);
    const fileIds = new Set<FileId>();
    for (const { value } of fileNodes) {
      if ("id" in value) {
        fileIds.add(value.id as FileId);
      }
    }
    return Array.from(fileIds);
  },

  /**
   * Goes through the supplied content struct - assumed to be abide by the
   * passed-in schema - searching for ProtoFile nodes. When such a node is
   * found:
   *
   * - An FileId for it is generated.
   * - The ProtoFile and its id are collected into an array.
   * - The node is converted into an FileRef.
   *
   * The function returns:
   *
   * - The list of ProtoFiles with ids.
   * - The converted copy of the passed-in content struct. (The passed-in
   *   content struct is NOT modified in-place.)
   */
  extractAndConvertProtoFiles(
    schema: Schema,
    content: any,
  ): {
    protoFilesWithIds: (ProtoFile & { id: FileId })[];
    convertedContent: any;
  } {
    const convertedContent = structuredClone(content);
    const fileNodes = findFileNodes(schema, convertedContent);
    const protoFilesWithIds: (ProtoFile & { id: FileId })[] = [];
    for (const { path, value } of fileNodes) {
      if ("content" in value) {
        const id: FileId = Id.generate.file();
        protoFilesWithIds.push({ ...value, id });
        const fileRef: FileRef = {
          id: id,
          name: value.name,
          mimeType: value.mimeType,
        };
        replaceValueAtPath(convertedContent, path, fileRef);
      }
    }
    return { convertedContent, protoFilesWithIds };
  },
};
