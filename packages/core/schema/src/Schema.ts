import type { AnyTypeDefinition } from "./typeDefinitions.js";

export default interface Schema {
  /**
   * Record (by name) of type definitions. Define complex types here once and
   * reuse them elsewhere in the schema. Type names **must** match the regex
   * `/^[a-zA-Z_][a-zA-Z0-9_]{0,127}$/`.
   */
  types: {
    [name: string]: AnyTypeDefinition;
  };
  /**
   * Ref to the type that defines the overall structure of the document. Must
   * exist in `types`. Must be a `StructTypeDefinition`.
   */
  rootType: string;
}
