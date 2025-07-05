import * as v from "valibot";
import type Schema from "../../../Schema.js";
import translate from "../../../utils/translate.js";
import difference from "../utils/difference.js";
import findRefs from "../utils/findRefs.js";
import { makeObjectPathItem } from "../utils/issuePathItemMakers.js";
import unique from "../utils/unique.js";

/**
 * Schema check that ensures that all defined types are "used", i.e. they are
 * referenced by some other type.
 */
export default v.rawCheck<Readonly<Schema>>(
  ({ dataset: { typed, value }, config: { lang }, addIssue }) => {
    if (typed) {
      const types = Object.keys(value.types);
      const usedTypes = unique([
        value.rootType,
        ...findRefs(value).map(({ ref }) => ref),
      ]);
      difference(types, usedTypes).forEach((type) => {
        addIssue({
          message: translate(lang, {
            en: "Unused type",
          }),
          path: [
            makeObjectPathItem(value, "types"),
            makeObjectPathItem(value.types, type),
          ],
        });
      });
    }
  },
);
