import type { DocumentRef, Schema } from "@superego/schema";
import findDocumentRefNodes from "./findDocumentRefNodes.js";

export default {
  /**
   * Goes through the supplied content struct - assumed to abide by the
   * passed-in schema - extracting the de-duplicated list of all DocumentRefs
   * referenced in it.
   *
   * Note: the process does NOT extract DocumentRefs that might be inside
   * JsonObject nodes or in String nodes.
   */
  extractDocumentRefs(schema: Schema, content: any): DocumentRef[] {
    const documentRefNodes = findDocumentRefNodes(schema, content);
    const seen = new Set<string>();
    const documentRefs: DocumentRef[] = [];

    for (const { value } of documentRefNodes) {
      const key = `${value.collectionId}:${value.documentId}`;
      if (!seen.has(key)) {
        seen.add(key);
        documentRefs.push(value);
      }
    }

    return documentRefs;
  },
};
