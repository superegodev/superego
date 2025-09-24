import * as v from "valibot";
import translate from "../../utils/translate.js";
import identifierRegex from "./identifierRegex.js";

/**
 * An identifier is a string used to identify either:
 *
 * - A Schema type (key in `Schema.types`).
 * - A Struct property (key in `StructTypeDefinition.properties`).
 * - An Enum member (key in `EnumTypeDefinition.members`).
 *
 * To simplify TypeScript code generation from a Schema, identifiers must:
 *
 * - Start with a letter (lowercase or uppercase).
 * - Only contain letters, numbers, or underscores.
 * - Be no longer than 128 characters.
 */
export default function identifier() {
  return v.pipe(
    v.string(),
    v.regex(identifierRegex, ({ received, expected, lang }) =>
      translate(lang, {
        en: `Invalid identifier: Should match ${expected} but received ${received}`,
      }),
    ),
  );
}
