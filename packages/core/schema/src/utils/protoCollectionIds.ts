import DataType from "../DataType.js";
import type Schema from "../Schema.js";
import type { AnyTypeDefinition } from "../typeDefinitions.js";

const PROTO_COLLECTION_ID_PREFIX = "ProtoCollection_";

export function makeProtoCollectionId(index: number): string {
  return `${PROTO_COLLECTION_ID_PREFIX}${index}`;
}

export function makeProtoCollectionIdMapping(
  actualIds: string[],
): Map<string, string> {
  const mapping = new Map<string, string>();
  for (let i = 0; i < actualIds.length; i++) {
    const id = actualIds[i];
    if (id !== undefined) {
      mapping.set(makeProtoCollectionId(i), id);
    }
  }
  return mapping;
}

export function isProtoCollectionId(id: string): boolean {
  return id.startsWith(PROTO_COLLECTION_ID_PREFIX);
}

export function parseProtoCollectionIndex(id: string): number | null {
  if (!isProtoCollectionId(id)) {
    return null;
  }
  const indexStr = id.slice(PROTO_COLLECTION_ID_PREFIX.length);
  const index = Number.parseInt(indexStr, 10);
  return !Number.isNaN(index) && index >= 0 ? index : null;
}

/**
 * Extracts all proto collection ID placeholders from DocumentRef type
 * definitions in the given schema.
 */
export function extractProtoCollectionIds(schema: Schema): string[] {
  const protoIds = new Set<string>();

  for (const typeDefinition of Object.values(schema.types)) {
    _extractFromTypeDefinition(schema, typeDefinition, protoIds);
  }

  return Array.from(protoIds);
}

function _extractFromTypeDefinition(
  schema: Schema,
  typeDefinition: AnyTypeDefinition,
  protoIds: Set<string>,
): void {
  if ("ref" in typeDefinition) {
    const referencedType = schema.types[typeDefinition.ref];
    if (referencedType) {
      _extractFromTypeDefinition(schema, referencedType, protoIds);
    }
    return;
  }

  if (typeDefinition.dataType === DataType.DocumentRef) {
    if (
      typeDefinition.collectionId !== undefined &&
      isProtoCollectionId(typeDefinition.collectionId)
    ) {
      protoIds.add(typeDefinition.collectionId);
    }
    return;
  }

  if (typeDefinition.dataType === DataType.Struct) {
    for (const propertyTypeDefinition of Object.values(
      typeDefinition.properties,
    )) {
      _extractFromTypeDefinition(schema, propertyTypeDefinition, protoIds);
    }
    return;
  }

  if (typeDefinition.dataType === DataType.List) {
    _extractFromTypeDefinition(schema, typeDefinition.items, protoIds);
  }
}

/**
 * Returns a new schema with all proto collection ID placeholders replaced with
 * actual collection IDs from the provided mapping.
 */
export function replaceProtoCollectionIds(
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
      isProtoCollectionId(typeDefinition.collectionId)
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
