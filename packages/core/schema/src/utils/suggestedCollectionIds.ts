import DataType from "../DataType.js";
import type Schema from "../Schema.js";
import type { AnyTypeDefinition } from "../typeDefinitions.js";

const SUGGESTED_COLLECTION_ID_PREFIX = "SuggestedCollection_";

export function makeSuggestedCollectionId(index: number): string {
  return `${SUGGESTED_COLLECTION_ID_PREFIX}${index}`;
}

export function makeSuggestedCollectionIdMapping(
  actualIds: string[],
): Map<string, string> {
  const mapping = new Map<string, string>();
  for (let i = 0; i < actualIds.length; i++) {
    const id = actualIds[i];
    if (id !== undefined) {
      mapping.set(makeSuggestedCollectionId(i), id);
    }
  }
  return mapping;
}

export function isSuggestedCollectionId(id: string): boolean {
  return id.startsWith(SUGGESTED_COLLECTION_ID_PREFIX);
}

export function parseSuggestedCollectionIndex(id: string): number | null {
  if (!isSuggestedCollectionId(id)) {
    return null;
  }
  const indexStr = id.slice(SUGGESTED_COLLECTION_ID_PREFIX.length);
  const index = Number.parseInt(indexStr, 10);
  return !Number.isNaN(index) && index >= 0 ? index : null;
}

/**
 * Extracts all suggested collection ID placeholders from DocumentRef type
 * definitions in the given schema.
 */
export function extractSuggestedCollectionIds(schema: Schema): string[] {
  const suggestedIds = new Set<string>();

  for (const typeDefinition of Object.values(schema.types)) {
    _extractFromTypeDefinition(schema, typeDefinition, suggestedIds);
  }

  return Array.from(suggestedIds);
}

function _extractFromTypeDefinition(
  schema: Schema,
  typeDefinition: AnyTypeDefinition,
  suggestedIds: Set<string>,
): void {
  if ("ref" in typeDefinition) {
    const referencedType = schema.types[typeDefinition.ref];
    if (referencedType) {
      _extractFromTypeDefinition(schema, referencedType, suggestedIds);
    }
    return;
  }

  if (typeDefinition.dataType === DataType.DocumentRef) {
    if (
      typeDefinition.collectionId !== undefined &&
      isSuggestedCollectionId(typeDefinition.collectionId)
    ) {
      suggestedIds.add(typeDefinition.collectionId);
    }
    return;
  }

  if (typeDefinition.dataType === DataType.Struct) {
    for (const propertyTypeDefinition of Object.values(
      typeDefinition.properties,
    )) {
      _extractFromTypeDefinition(schema, propertyTypeDefinition, suggestedIds);
    }
    return;
  }

  if (typeDefinition.dataType === DataType.List) {
    _extractFromTypeDefinition(schema, typeDefinition.items, suggestedIds);
  }
}

/**
 * Returns a new schema with all suggested collection ID placeholders replaced
 * with actual collection IDs from the provided mapping.
 */
export function replaceSuggestedCollectionIds(
  schema: Schema,
  idMapping: Map<string, string>,
): Schema {
  return {
    ...schema,
    types: Object.fromEntries(
      Object.entries(schema.types).map(([name, typeDefinition]) => [
        name,
        _replaceInTypeDefinition(typeDefinition, idMapping),
      ]),
    ),
  };
}

function _replaceInTypeDefinition(
  typeDefinition: AnyTypeDefinition,
  idMapping: Map<string, string>,
): AnyTypeDefinition {
  if ("ref" in typeDefinition) {
    return typeDefinition;
  }

  if (typeDefinition.dataType === DataType.DocumentRef) {
    if (
      typeDefinition.collectionId !== undefined &&
      isSuggestedCollectionId(typeDefinition.collectionId)
    ) {
      const actualId = idMapping.get(typeDefinition.collectionId);
      if (actualId) {
        return { ...typeDefinition, collectionId: actualId };
      }
    }
    return typeDefinition;
  }

  if (typeDefinition.dataType === DataType.Struct) {
    return {
      ...typeDefinition,
      properties: Object.fromEntries(
        Object.entries(typeDefinition.properties).map(([name, propDef]) => [
          name,
          _replaceInTypeDefinition(propDef, idMapping),
        ]),
      ),
    };
  }

  if (typeDefinition.dataType === DataType.List) {
    return {
      ...typeDefinition,
      items: _replaceInTypeDefinition(typeDefinition.items, idMapping),
    };
  }

  return typeDefinition;
}
