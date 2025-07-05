import * as v from "valibot";
import translate from "../../../utils/translate.js";

/**
 * JsonObject check that ensures that the value can be serialized as a JSON
 * object.
 */
export default v.check(
  (input) => serializesAsJsonObject(input),
  ({ lang }) =>
    translate(lang, {
      en: "Invalid JsonObject: Does not serialize to a JSON object",
    }),
);

function serializesAsJsonObject(value: unknown): boolean {
  try {
    const json = JSON.stringify(value);
    return json.startsWith("{");
  } catch {
    return false;
  }
}
