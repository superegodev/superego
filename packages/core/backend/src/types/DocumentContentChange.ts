import DocumentContentChangeType from "../enums/DocumentContentChangeType.js";
import type JsonPatchOperation from "./JsonPatchOperation.js";

type DocumentContentChange =
  | {
      type: DocumentContentChangeType.Full;
      content: unknown;
    }
  | {
      type: DocumentContentChangeType.Patch;
      patch: JsonPatchOperation[];
    };

export default DocumentContentChange;
