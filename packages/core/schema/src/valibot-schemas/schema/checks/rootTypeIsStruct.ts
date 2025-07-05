import * as v from "valibot";
import DataType from "../../../DataType.js";
import type Schema from "../../../Schema.js";
import translate from "../../../utils/translate.js";
import { makeObjectPathItem } from "../utils/issuePathItemMakers.js";

/** Schema check that ensures that the rootType exists and is a Struct. */
export default v.rawCheck<Readonly<Schema>>(
  ({ dataset: { typed, value }, config: { lang }, addIssue }) => {
    if (typed) {
      const rootType = value.types[value.rootType];
      if (rootType === undefined) {
        addIssue({
          message: translate(lang, {
            en: "Type not found",
          }),
          path: [makeObjectPathItem(value, "rootType")],
        });
      } else if (rootType.dataType !== DataType.Struct) {
        addIssue({
          message: translate(lang, {
            en: "Root type must be a Struct",
          }),
          path: [makeObjectPathItem(value, "rootType")],
        });
      }
    }
  },
);
