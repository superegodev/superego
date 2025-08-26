import type { JSONSchema7 } from "json-schema";
import type ReferencedBuiltInTypes from "./ReferencedBuiltInTypes.js";

const jsonObject: JSONSchema7 = {
  title: "JsonObject",
  type: "object",
  properties: {
    __dataType: { type: "string", const: "JsonObject" },
  },
  required: ["__dataType"],
  additionalProperties: true,
};

const protoFile: JSONSchema7 = {
  title: "ProtoFile",
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "File name + extension.",
      examples: ["book.pdf"],
    },
    mimeType: {
      type: "string",
    },
    content: {
      type: "string",
      description: "The binary content of the file, in base64.",
    },
  },
  required: ["name", "mimeType", "content"],
  additionalProperties: false,
};

const fileRef: JSONSchema7 = {
  title: "ProtoFile",
  type: "object",
  properties: {
    id: { type: "string" },
    name: {
      type: "string",
      description: "File name + extension.",
      examples: ["book.pdf"],
    },
    mimeType: {
      type: "string",
    },
  },
  required: ["id", "name", "mimeType"],
  additionalProperties: false,
};

export default function generateBuiltInTypesDefs(
  referencedBuiltInTypes: ReferencedBuiltInTypes,
): JSONSchema7["$defs"] {
  const $defs: JSONSchema7["$defs"] = {};
  if (referencedBuiltInTypes.has("JsonObject")) {
    $defs["JsonObject"] = jsonObject;
  }
  if (referencedBuiltInTypes.has("File")) {
    $defs["ProtoFile"] = protoFile;
    $defs["FileRef"] = fileRef;
  }
  return $defs;
}
