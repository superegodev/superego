import * as v from "valibot";
import type { StructTypeDefinition } from "../../../typeDefinitions.js";
import translate from "../../../utils/translate.js";
import {
  makeArrayPathItem,
  makeObjectPathItem,
} from "../utils/issuePathItemMakers.js";

/**
 * Struct type definition check that ensures that, if `nullableProperties` is
 * specified:
 * - Only contains `properties` of the Struct.
 * - Doesn't contain duplicates.
 */
export default v.rawCheck<Readonly<StructTypeDefinition>>(
  ({ dataset: { typed, value }, config: { lang }, addIssue }) => {
    if (typed && value.nullableProperties !== undefined) {
      const nullableProperties = new Set(value.nullableProperties);
      if (nullableProperties.size !== value.nullableProperties.length) {
        addIssue({
          message: translate(lang, { en: "Must not contain duplicates" }),
          path: [makeObjectPathItem(value, "nullableProperties")],
        });
      }

      const properties = new Set(Object.keys(value.properties));
      value.nullableProperties?.forEach((nullableProperty, index) => {
        if (!properties.has(nullableProperty)) {
          addIssue({
            message: translate(lang, {
              en: `Property "${nullableProperty}" does not exist in struct`,
            }),
            path: [
              makeObjectPathItem(value, "nullableProperties"),
              makeArrayPathItem(value.nullableProperties!, index),
            ],
          });
        }
      });
    }
  },
);
