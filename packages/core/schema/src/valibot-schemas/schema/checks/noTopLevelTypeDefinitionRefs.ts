import * as v from "valibot";
import type Schema from "../../../Schema.js";
import translate from "../../../utils/translate.js";
import { makeObjectPathItem } from "../utils/issuePathItemMakers.js";

/**
 * Schema check that ensures no top-level type definition is a type definition
 * ref. This makes it impossible to have "senseless" ref cycles where it's
 * impossible to determine the data type of a struct property or a list item.
 * Example:
 *
 * ```js
 * {
 *   types: {
 *     Root: {
 *       dataType: DataType.Struct,
 *       properties: {
 *         a: { dataType: null, ref: "A" }
 *       }
 *     },
 *     A: { dataType: null, ref: "B" },
 *     B: { dataType: null, ref: "A" }
 *   },
 *   rootType: "Root"
 * }
 * ```
 *
 * This does NOT prevent cycles. For example, the following schema is allowed,
 * even though there's never going to be a value that satisfies it:
 *
 * ```js
 * {
 *   types: {
 *     Root: {
 *       dataType: DataType.Struct,
 *       properties: {
 *         a: { dataType: null, ref: "A" }
 *       }
 *     },
 *     A: {
 *       dataType: DataType.Struct,
 *       properties: {
 *         b: { dataType: null, ref: "B" }
 *       }
 *     },
 *     B: {
 *       dataType: DataType.Struct,
 *       properties: {
 *         a: { dataType: null, ref: "A" }
 *       }
 *     },
 *   },
 *   rootType: "Root"
 * }
 * ```
 *
 * FUTURE IMPROVEMENT: consider replacing this check with a proper
 * cycle-detection check.
 */
export default v.rawCheck<Readonly<Schema>>(
  ({ dataset: { typed, value }, config: { lang }, addIssue }) => {
    if (typed) {
      Object.entries(value.types).forEach(([typeName, typeDefinition]) => {
        if ("ref" in typeDefinition) {
          addIssue({
            message: translate(lang, {
              en: `Top-level type "${typeName}" cannot be a type definition ref`,
            }),
            path: [
              makeObjectPathItem(value, "types"),
              makeObjectPathItem(value.types, typeName),
            ],
          });
        }
      });
    }
  },
);
