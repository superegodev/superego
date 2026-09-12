import * as v from "valibot";
import normalizeHttpOrigin from "../normalizeHttpOrigin.js";

export default function httpOrigin(
  message = "Expected a normalized HTTP(S) origin without a trailing slash.",
) {
  return v.pipe(
    v.string(),
    v.check((origin) => {
      try {
        return normalizeHttpOrigin(origin) === origin;
      } catch {
        return false;
      }
    }, message),
  );
}
