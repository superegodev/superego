import * as v from "valibot";

/** @internal exported only for tests */
export const MIN_LENGTH = 1;
/** @internal exported only for tests */
export const MAX_LENGTH = 32;

export default function appName() {
  return v.pipe(v.string(), v.maxLength(MAX_LENGTH), v.minLength(MIN_LENGTH));
}
