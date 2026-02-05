import type { CollectionId, ProtoCollectionId } from "@superego/backend";
import {
  type AnyTypeDefinition,
  DataType,
  type Schema,
} from "@superego/schema";
import { Id } from "@superego/shared-utils";

export function makeProtoCollectionIdMapping(
  collectionIds: CollectionId[],
): Map<ProtoCollectionId, CollectionId> {
  return new Map(
    collectionIds.map((collectionId, index) => [
      Id.generate.protoCollection(index),
      collectionId,
    ]),
  );
}

/**
 * Extracts all proto collection ID placeholders from DocumentRef type
 * definitions in the given schema.
 */
export function extractProtoCollectionIds(
  schema: Schema,
): Set<ProtoCollectionId> {
  const protoCollectionIds = new Set<ProtoCollectionId>();
  for (const typeDefinition of Object.values(schema.types)) {
    _extractFromTypeDefinition(schema, typeDefinition, protoCollectionIds);
  }
  return protoCollectionIds;
}

function _extractFromTypeDefinition(
  schema: Schema,
  typeDefinition: AnyTypeDefinition,
  protoCollectionIds: Set<ProtoCollectionId>,
): void {
  if ("ref" in typeDefinition) {
    const referencedType = schema.types[typeDefinition.ref];
    if (referencedType) {
      _extractFromTypeDefinition(schema, referencedType, protoCollectionIds);
    }
    return;
  }

  if (typeDefinition.dataType === DataType.DocumentRef) {
    if (
      typeDefinition.collectionId !== undefined &&
      Id.is.protoCollection(typeDefinition.collectionId)
    ) {
      protoCollectionIds.add(typeDefinition.collectionId);
    }
    return;
  }

  if (typeDefinition.dataType === DataType.Struct) {
    for (const propertyTypeDefinition of Object.values(
      typeDefinition.properties,
    )) {
      _extractFromTypeDefinition(
        schema,
        propertyTypeDefinition,
        protoCollectionIds,
      );
    }
    return;
  }

  if (typeDefinition.dataType === DataType.List) {
    _extractFromTypeDefinition(
      schema,
      typeDefinition.items,
      protoCollectionIds,
    );
  }
}

/**
 * Returns a new schema with all proto collection ID placeholders replaced with
 * collection IDs from the provided mapping.
 */
export function replaceProtoCollectionIds(
  schema: Schema,
  idMapping: Map<ProtoCollectionId, CollectionId>,
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
  idMapping: Map<ProtoCollectionId, CollectionId>,
): AnyTypeDefinition {
  if ("ref" in typeDefinition) {
    return typeDefinition;
  }

  if (typeDefinition.dataType === DataType.DocumentRef) {
    if (
      typeDefinition.collectionId !== undefined &&
      Id.is.protoCollection(typeDefinition.collectionId)
    ) {
      const collectionId = idMapping.get(typeDefinition.collectionId);
      if (collectionId) {
        return { ...typeDefinition, collectionId };
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
