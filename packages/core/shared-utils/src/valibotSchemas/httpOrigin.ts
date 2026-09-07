import * as v from "valibot";
import normalizeHttpOrigin from "../normalizeHttpOrigin.js";

export default function httpOrigin() {
  return v.pipe(
    v.string(),
    v.check((origin) => {
      try {
        normalizeHttpOrigin(origin);
        return true;
      } catch {
        return false;
      }
    }, "Expected an HTTP(S) origin."),
    v.transform(normalizeHttpOrigin),
  );
}
