import type JsonPatchOperation from "./JsonPatchOperation.js";

type DocumentContentChange =
  | {
      type: "full";
      content: unknown;
    }
  | {
      type: "patch";
      patch: JsonPatchOperation[];
    };

export default DocumentContentChange;
