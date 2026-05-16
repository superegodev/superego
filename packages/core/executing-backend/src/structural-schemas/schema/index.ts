import * as v from "valibot";

/**
 * Structural-only shape check for a `Schema`. Used in argument schemas, where
 * the full semantic validation (which also enforces rules like "root type must
 * be a Struct") is left to the usecase so it can surface a domain error
 * instead of a generic `ArgumentsNotValid`.
 */
export function schemaShape() {
  return v.looseObject({
    types: v.record(v.string(), v.looseObject({})),
    rootType: v.string(),
  });
}
