import * as v from "valibot";
import type { StructTypeDefinition } from "../../../typeDefinitions.js";
import translate from "../../../utils/translate.js";
import {
  makeArrayPathItem,
  makeObjectPathItem,
} from "../utils/issuePathItemMakers.js";

/**
 * Struct type definition check that ensures that all nullable properties (if
 * there are any) exist in the struct.
 */
export default v.rawCheck<Readonly<StructTypeDefinition>>(
  ({ dataset: { typed, value }, config: { lang }, addIssue }) => {
    if (typed) {
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
