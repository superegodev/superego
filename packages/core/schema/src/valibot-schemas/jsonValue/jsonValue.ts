import * as v from "valibot";
import isJsonInvariant from "../../utils/isJsonInvariant.js";
import translate from "../../utils/translate.js";

export default function jsonValue() {
  return v.pipe(
    v.unknown(),
    v.check(isJsonInvariant, ({ lang }) =>
      translate(lang, {
        en: "Invalid JSON value: not JSON-invariant",
        it: "Valore JSON non valido: non invariante alla serializzazione JSON",
      }),
    ),
  );
}
