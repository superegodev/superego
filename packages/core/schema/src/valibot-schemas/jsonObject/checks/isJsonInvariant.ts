import * as v from "valibot";
import type { JsonObject } from "../../../index.js";
import isJsonInvariant from "../../../utils/isJsonInvariant.js";
import translate from "../../../utils/translate.js";

/**
 * JsonObject check that ensures that the object remains unchanged when
 * JSON-stringified and JSON-parsed.
 */
export default v.check(
  (input: JsonObject) => isJsonInvariant(input),
  ({ lang }) =>
    translate(lang, {
      en: "Invalid JsonObject: not JSON-invariant",
    }),
);
