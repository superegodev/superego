import type Schema from "../Schema.js";
import type { StructTypeDefinition } from "../typeDefinitions.js";

export default function rootType(schema: Schema): StructTypeDefinition {
  return schema.types[schema.rootType] as StructTypeDefinition;
}
