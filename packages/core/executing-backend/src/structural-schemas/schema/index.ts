import * as v from "valibot";

/**
 * Structural-only shape check for a `Schema`. Used in argument schemas, where
 * the full semantic validation (which also enforces rules like "root type must
 * be a Struct") is left to the usecase so it can surface a domain error
 * instead of a generic `ArgumentsNotValid`.
 */
export function schemaShape() {
  return v.strictObject({
    // Keep each type definition intentionally open: semantic schema validation
    // happens inside the usecase so callers get CollectionSchemaNotValid /
    // PackNotValid instead of ArgumentsNotValid for malformed schemas.
    types: v.record(v.string(), v.objectWithRest({}, v.any())),
    rootType: v.string(),
  });
}
