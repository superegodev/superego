import type Schema from "../Schema.js";
import type {
  AnyTypeDefinition,
  TypeDefinitionRef,
} from "../typeDefinitions.js";

export default function getType(
  /** A valid schema. */
  schema: Schema,
  typeDefinition: TypeDefinitionRef,
): AnyTypeDefinition {
  return schema.types[typeDefinition.ref]!;
}
