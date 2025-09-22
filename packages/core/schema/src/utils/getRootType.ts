import type Schema from "../Schema.js";
import type { StructTypeDefinition } from "../typeDefinitions.js";

export default function getRootType(
  /** A valid schema. */
  schema: Schema,
): StructTypeDefinition {
  return schema.types[schema.rootType] as StructTypeDefinition;
}
