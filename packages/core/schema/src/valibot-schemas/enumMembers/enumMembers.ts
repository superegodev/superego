import * as v from "valibot";
import translate from "../../utils/translate.js";
import described from "../described/described.js";
import identifier from "../identifier/identifier.js";

export default function enumMembers() {
  return v.pipe(
    v.record(
      identifier(),
      v.strictObject({
        ...described().entries,
        value: v.string(),
      }),
    ),
    v.minEntries(1),
    v.check(
      (members) => {
        const values = Object.values(members).map(({ value }) => value);
        return new Set(values).size === values.length;
      },
      ({ lang }) =>
        translate(lang, {
          en: "Invalid members: Values must be unique",
        }),
    ),
  );
}
