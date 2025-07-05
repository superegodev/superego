import * as v from "valibot";
import type Schema from "../../../Schema.js";
import translate from "../../../utils/translate.js";
import findRefs from "../utils/findRefs.js";
import getObjectPath from "../utils/getObjectPath.js";
import { makeObjectPathItem } from "../utils/issuePathItemMakers.js";

/** Schema check that ensures that all referenced types exist. */
export default v.rawCheck<Readonly<Schema>>(
  ({ dataset: { typed, value }, config: { lang }, addIssue }) => {
    if (typed) {
      const types = new Set(Object.keys(value.types));
      findRefs(value).forEach(({ ref, path }) => {
        if (!types.has(ref)) {
          addIssue({
            message: translate(lang, {
              en: "Type not found",
            }),
            path: path.map((segment, index) =>
              makeObjectPathItem(
                getObjectPath(value, path.slice(0, index)) as any,
                segment,
              ),
            ) as [v.ObjectPathItem, ...v.ObjectPathItem[]],
          });
        }
      });
    }
  },
);
