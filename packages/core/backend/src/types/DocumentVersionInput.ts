import type JsonPatchOperation from "./JsonPatchOperation.js";

type DocumentVersionInput =
  | {
      type: "full";
      content: unknown;
    }
  | {
      type: "patch";
      patch: JsonPatchOperation[];
    };

export default DocumentVersionInput;
