import joinLines from "./joinLines.js";
import type ReferencedBuiltInTypes from "./ReferencedBuiltInTypes.js";
import removeIndent from "./removeIndent.js";

const jsonObject = removeIndent(`
  export type JsonObject = {
    __dataType: "JsonObject";
    [key: string]: any;
  };
`);
const file = removeIndent(`
  export type FileRef = {
    id: string;
    /**
     * Name + extension.
     * @example book.pdf
     */
    name: string;
    mimeType: string;
  };

  export type ProtoFile = {
    /**
     * File name + extension.
     * @example book.pdf
     */
    name: string;
    mimeType: string;
    /** The binary content of the file. */
    content: Uint8Array;
  };
`);

export default function generateBuiltInTypes(
  referencedBuiltInTypes: ReferencedBuiltInTypes,
): string {
  return joinLines([
    referencedBuiltInTypes.has("JsonObject") ? jsonObject : null,
    referencedBuiltInTypes.has("File") ? file : null,
  ]);
}
