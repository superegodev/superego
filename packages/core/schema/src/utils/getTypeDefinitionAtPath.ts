import DataType from "../DataType.js";
import type Schema from "../Schema.js";
import type {
  AnyTypeDefinition,
  TypeDefinitionRef,
} from "../typeDefinitions.js";
import getRootType from "./getRootType.js";
import getType from "./getType.js";
import type { PathSegment } from "./parsePath.js";
import parsePath from "./parsePath.js";

// TODO: currently not used anywhere. Remove?
export default function getTypeDefinitionAtPath(
  schema: Schema,
  path: string,
): Exclude<AnyTypeDefinition, TypeDefinitionRef> | null {
  return getTypeDefinition(schema, getRootType(schema), parsePath(path));
}

function getTypeDefinition(
  schema: Schema,
  typeDefinition: AnyTypeDefinition,
  path: PathSegment[],
): Exclude<AnyTypeDefinition, TypeDefinitionRef> | null {
  // Handle refs.
  if (typeDefinition.dataType === null) {
    return getTypeDefinition(schema, getType(schema, typeDefinition), path);
  }
  // Handle last path segment.
  if (path.length === 0) {
    return typeDefinition;
  }
  // Recurse for lists and structs.
  const [first, ...rest] = path as [PathSegment, ...PathSegment[]];
  return first.type === "ListItem"
    ? typeDefinition.dataType === DataType.List
      ? getTypeDefinition(schema, typeDefinition.items, rest)
      : null
    : typeDefinition.dataType === DataType.Struct &&
        first.value in typeDefinition.properties
      ? getTypeDefinition(schema, typeDefinition.properties[first.value]!, rest)
      : null;
}
