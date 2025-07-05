import * as v from "valibot";
import translate from "../../utils/translate.js";
import fileExtensionRegex from "./fileExtensionRegex.js";

export default function acceptedFileExtensions() {
  return v.union([
    v.literal("*"),
    v.array(
      v.pipe(
        v.string(),
        v.regex(fileExtensionRegex, ({ received, lang }) =>
          translate(lang, {
            en: `Invalid file extension: Received ${received}`,
          }),
        ),
      ),
    ),
  ]);
}
