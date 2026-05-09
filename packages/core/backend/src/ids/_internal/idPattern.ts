// Mirrors `base58Alphabet` in @superego/shared-utils. Inlined here because
// importing from shared-utils would create a cycle (shared-utils already
// depends on @superego/backend).
const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** Regex for an ID like `Foo_<base58 21-char id>`. */
export function idPattern(prefix: string): RegExp {
  return new RegExp(`^${prefix}_[${BASE58_ALPHABET}]{21}$`);
}

/** Regex for a proto ID like `ProtoFoo_<positive integer>`. */
export function protoIdPattern(prefix: string): RegExp {
  return new RegExp(`^${prefix}_\\d+$`);
}
