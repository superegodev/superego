import * as v from "valibot";
import type { StructTypeDefinition } from "../../../typeDefinitions.js";
import translate from "../../../utils/translate.js";
import { makeObjectPathItem } from "../utils/issuePathItemMakers.js";

/**
 * Struct type definition check that ensures that, if `propertiesOrder` is
 * specified:
 * - Contains all `properties` in the Struct.
 * - Doesn't contain anything else.
 * - Doesn't contain duplicates.
 */
export default v.rawCheck<Readonly<StructTypeDefinition>>(
  ({ dataset: { typed, value }, config: { lang }, addIssue }) => {
    if (typed && value.propertiesOrder !== undefined) {
      const propertiesOrder = new Set(value.propertiesOrder);
      if (propertiesOrder.size !== value.propertiesOrder.length) {
        addIssue({
          message: translate(lang, { en: "Must not contain duplicates" }),
          path: [makeObjectPathItem(value, "propertiesOrder")],
        });
      }

      const properties = new Set(Object.keys(value.properties));
      if (properties.symmetricDifference(propertiesOrder).size !== 0) {
        addIssue({
          message: translate(lang, {
            en: "Must contain all property names and nothing else",
          }),
          path: [makeObjectPathItem(value, "propertiesOrder")],
        });
      }
    }
  },
);
