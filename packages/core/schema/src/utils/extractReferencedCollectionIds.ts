import DataType from "../DataType.js";
import type Schema from "../Schema.js";
import type { AnyTypeDefinition } from "../typeDefinitions.js";

/**
 * Extracts all unique collection IDs referenced by DocumentRef type definitions
 * in the given schema. Only includes collectionIds that are explicitly
 * constrained (i.e., where DocumentRefTypeDefinition.collectionId is defined).
 */
export default function extractReferencedCollectionIds(
  schema: Schema,
): string[] {
  const collectionIds = new Set<string>();

  for (const typeDefinition of Object.values(schema.types)) {
    _extractFromTypeDefinition(schema, typeDefinition, collectionIds);
  }

  return Array.from(collectionIds);
}

function _extractFromTypeDefinition(
  schema: Schema,
  typeDefinition: AnyTypeDefinition,
  collectionIds: Set<string>,
): void {
  if ("ref" in typeDefinition) {
    const referencedType = schema.types[typeDefinition.ref];
    if (referencedType) {
      _extractFromTypeDefinition(schema, referencedType, collectionIds);
    }
  }

  if (typeDefinition.dataType === DataType.DocumentRef) {
    if (typeDefinition.collectionId !== undefined) {
      collectionIds.add(typeDefinition.collectionId);
    }
  }

  if (typeDefinition.dataType === DataType.Struct) {
    for (const propertyTypeDefinition of Object.values(
      typeDefinition.properties,
    )) {
      _extractFromTypeDefinition(schema, propertyTypeDefinition, collectionIds);
    }
  }

  if (typeDefinition.dataType === DataType.List) {
    _extractFromTypeDefinition(schema, typeDefinition.items, collectionIds);
  }
}
