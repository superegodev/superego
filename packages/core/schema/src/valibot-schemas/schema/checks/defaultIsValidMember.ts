import * as v from "valibot";
import type { EnumTypeDefinition } from "../../../typeDefinitions.js";
import translate from "../../../utils/translate.js";
import { makeObjectPathItem } from "../utils/issuePathItemMakers.js";

/**
 * Enum type definition check that ensures that, if `default` is specified, it
 * is a valid member name.
 */
export default v.rawCheck<Readonly<EnumTypeDefinition>>(
  ({ dataset: { typed, value }, config: { lang }, addIssue }) => {
    if (typed && value.default !== undefined) {
      if (!(value.default in value.members)) {
        addIssue({
          message: translate(lang, {
            en: "Must be a valid member name",
          }),
          path: [makeObjectPathItem(value, "default")],
        });
      }
    }
  },
);
