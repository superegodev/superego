import * as v from "valibot";
import type { JsonObject } from "../../../index.js";
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

function isJsonInvariant(value: unknown): boolean {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value)) ||
    (Array.isArray(value) &&
      value.every((element) => isJsonInvariant(element))) ||
    (isPlainObject(value) &&
      Object.values(value).every((propertyValue) =>
        isJsonInvariant(propertyValue),
      ))
  );
}

/**
 * Checks if value is a plain object, that is, an object created by the Object
 * constructor or one with a [[Prototype]] of null.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  let proto = value;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return (
    Object.getPrototypeOf(value) === proto ||
    Object.getPrototypeOf(value) === null
  );
}
