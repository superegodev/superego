import * as v from "valibot";
import translate from "../../utils/translate.js";
import mimeTypeMatcherRegex from "./mimeTypeMatcherRegex.js";

export default function mimeTypeMatcher() {
  return v.pipe(
    v.string(),
    v.regex(mimeTypeMatcherRegex, ({ lang, received }) =>
      translate(lang, {
        en: `Invalid mime type matcher: Received ${received}`,
      }),
    ),
  );
}
