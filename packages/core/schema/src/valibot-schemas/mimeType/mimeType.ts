import * as v from "valibot";
import translate from "../../utils/translate.js";
import mimeTypeRegex from "./mimeTypeRegex.js";

export default function mimeType() {
  return v.pipe(
    v.string(),
    v.regex(mimeTypeRegex, ({ lang, received }) =>
      translate(lang, { en: `Invalid mime type: Received ${received}` }),
    ),
  );
}
