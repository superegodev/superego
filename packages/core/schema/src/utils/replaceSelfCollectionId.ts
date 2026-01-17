import DataType from "../DataType.js";
import type Schema from "../Schema.js";
import type { AnyTypeDefinition } from "../typeDefinitions.js";

export const SELF_COLLECTION_ID = "self";

/**
 * Returns a new schema with all DocumentRef "self" collectionIds replaced
 * with the actual collection ID.
 */
export default function replaceSelfCollectionId(
  schema: Schema,
  collectionId: string,
): Schema {
  return {
    ...schema,
    types: Object.fromEntries(
      Object.entries(schema.types).map(([name, typeDefinition]) => [
        name,
        replaceInTypeDefinition(typeDefinition, collectionId),
      ]),
    ),
  };
}

function replaceInTypeDefinition(
  typeDefinition: AnyTypeDefinition,
  collectionId: string,
): AnyTypeDefinition {
  if ("ref" in typeDefinition) {
    return typeDefinition;
  }

  if (typeDefinition.dataType === DataType.DocumentRef) {
    if (typeDefinition.collectionId === SELF_COLLECTION_ID) {
      return { ...typeDefinition, collectionId };
    }
    return typeDefinition;
  }

  if (typeDefinition.dataType === DataType.Struct) {
    return {
      ...typeDefinition,
      properties: Object.fromEntries(
        Object.entries(typeDefinition.properties).map(([name, propDef]) => [
          name,
          replaceInTypeDefinition(propDef, collectionId),
        ]),
      ),
    };
  }

  if (typeDefinition.dataType === DataType.List) {
    return {
      ...typeDefinition,
      items: replaceInTypeDefinition(typeDefinition.items, collectionId),
    };
  }

  return typeDefinition;
}
