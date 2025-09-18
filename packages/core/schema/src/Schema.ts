import type { AnyTypeDefinition } from "./typeDefinitions.js";

export default interface Schema {
  /**
   * Record (by name) of type definitions. Define complex types here once and
   * reuse them elsewhere in the schema.
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
