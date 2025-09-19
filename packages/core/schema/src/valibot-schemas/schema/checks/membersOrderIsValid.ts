import * as v from "valibot";
import type { EnumTypeDefinition } from "../../../typeDefinitions.js";
import translate from "../../../utils/translate.js";
import { makeObjectPathItem } from "../utils/issuePathItemMakers.js";

/**
 * Enum type definition check that ensures that, if `membersOrder` is specified:
 * - Contains all `members` in the Enum.
 * - Doesn't contain anything else.
 * - Doesn't contain duplicates.
 */
export default v.rawCheck<Readonly<EnumTypeDefinition>>(
  ({ dataset: { typed, value }, config: { lang }, addIssue }) => {
    if (typed && value.membersOrder !== undefined) {
      const membersOrder = new Set(value.membersOrder);
      if (membersOrder.size !== value.membersOrder.length) {
        addIssue({
          message: translate(lang, { en: "Must not contain duplicates" }),
          path: [makeObjectPathItem(value, "membersOrder")],
        });
      }

      const members = new Set(Object.keys(value.members));
      if (members.symmetricDifference(membersOrder).size !== 0) {
        addIssue({
          message: translate(lang, {
            en: "Must contain all member names and nothing else",
          }),
          path: [makeObjectPathItem(value, "membersOrder")],
        });
      }
    }
  },
);
