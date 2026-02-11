import type {
  AppId,
  CollectionCategoryId,
  CollectionId,
  DocumentId,
  ProtoAppId,
  ProtoCollectionCategoryId,
  ProtoCollectionId,
  ProtoDocumentId,
} from "@superego/backend";
import {
  type AnyTypeDefinition,
  DataType,
  type Schema,
  utils,
} from "@superego/schema";
import { Id } from "@superego/shared-utils";

export function makeProtoCollectionCategoryIdMapping(
  collectionCategoryIds: CollectionCategoryId[],
): Map<ProtoCollectionCategoryId, CollectionCategoryId> {
  return new Map(
    collectionCategoryIds.map((collectionCategoryId, index) => [
      Id.generate.protoCollectionCategory(index),
      collectionCategoryId,
    ]),
  );
}

/**
 * Replaces a proto collection category ID with the actual ID from the mapping.
 * Returns the original ID if it's not a proto ID or if it's not found in the
 * mapping.
 */
export function replaceProtoCollectionCategoryId(
  id: ProtoCollectionCategoryId | CollectionCategoryId | null,
  idMapping: Map<ProtoCollectionCategoryId, CollectionCategoryId>,
): CollectionCategoryId | null {
  if (id === null) {
    return null;
  }
  if (Id.is.protoCollectionCategory(id)) {
    const mappedId = idMapping.get(id);
    if (mappedId) {
      return mappedId;
    }
  }
  return id as CollectionCategoryId;
}

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
 * Extracts all proto collection IDs from DocumentRef type definitions in the
 * given schema.
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
 * Returns a new schema with all proto collection IDs replaced with collection
 * IDs from the provided mapping.
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

export function makeProtoDocumentIdMapping(
  documentIds: DocumentId[],
): Map<ProtoDocumentId, DocumentId> {
  return new Map(
    documentIds.map((documentId, index) => [
      Id.generate.protoDocument(index),
      documentId,
    ]),
  );
}

/**
 * Extracts all proto document IDs from DocumentRef values in the given content.
 */
export function extractProtoDocumentIds(
  schema: Schema,
  content: any,
): Set<ProtoDocumentId> {
  const protoDocumentIds = new Set<ProtoDocumentId>();
  _extractFromContent(
    schema,
    content,
    utils.getRootType(schema),
    protoDocumentIds,
  );
  return protoDocumentIds;
}

function _extractFromContent(
  schema: Schema,
  value: any,
  typeDefinition: AnyTypeDefinition,
  protoDocumentIds: Set<ProtoDocumentId>,
): void {
  if (value === null || value === undefined) {
    return;
  }

  if ("ref" in typeDefinition) {
    _extractFromContent(
      schema,
      value,
      utils.getType(schema, typeDefinition),
      protoDocumentIds,
    );
    return;
  }

  if (typeDefinition.dataType === DataType.DocumentRef) {
    if (
      typeof value === "object" &&
      typeof value.documentId === "string" &&
      Id.is.protoDocument(value.documentId)
    ) {
      protoDocumentIds.add(value.documentId);
    }
    return;
  }

  if (typeDefinition.dataType === DataType.Struct) {
    for (const [propertyName, propertyTypeDefinition] of Object.entries(
      typeDefinition.properties,
    )) {
      _extractFromContent(
        schema,
        value[propertyName],
        propertyTypeDefinition,
        protoDocumentIds,
      );
    }
    return;
  }

  if (typeDefinition.dataType === DataType.List) {
    if (Array.isArray(value)) {
      for (const item of value) {
        _extractFromContent(
          schema,
          item,
          typeDefinition.items,
          protoDocumentIds,
        );
      }
    }
  }
}

/**
 * Returns new content with all proto document IDs and proto collection IDs in
 * DocumentRef values replaced with actual IDs from the provided mappings.
 */
export function replaceProtoDocumentIdsAndProtoCollectionIds(
  schema: Schema,
  content: any,
  documentIdMapping: Map<ProtoDocumentId, DocumentId>,
  collectionIdMapping?: Map<ProtoCollectionId, CollectionId>,
): any {
  return _replaceInContent(
    schema,
    content,
    utils.getRootType(schema),
    documentIdMapping,
    collectionIdMapping ?? new Map(),
  );
}

function _replaceInContent(
  schema: Schema,
  value: any,
  typeDefinition: AnyTypeDefinition,
  documentIdMapping: Map<ProtoDocumentId, DocumentId>,
  collectionIdMapping: Map<ProtoCollectionId, CollectionId>,
): any {
  if (value === null || value === undefined) {
    return value;
  }

  if ("ref" in typeDefinition) {
    return _replaceInContent(
      schema,
      value,
      utils.getType(schema, typeDefinition),
      documentIdMapping,
      collectionIdMapping,
    );
  }

  if (typeDefinition.dataType === DataType.DocumentRef) {
    if (typeof value === "object") {
      let result = value;

      // Replace proto document ID if present.
      if (
        typeof value.documentId === "string" &&
        Id.is.protoDocument(value.documentId)
      ) {
        const documentId = documentIdMapping.get(value.documentId);
        if (documentId) {
          result = { ...result, documentId };
        }
      }

      // Replace proto collection ID if present.
      if (
        typeof value.collectionId === "string" &&
        Id.is.protoCollection(value.collectionId)
      ) {
        const collectionId = collectionIdMapping.get(value.collectionId);
        if (collectionId) {
          result = { ...result, collectionId };
        }
      }

      return result;
    }
    return value;
  }

  if (typeDefinition.dataType === DataType.Struct) {
    const result: Record<string, any> = {};
    for (const [propertyName, propertyTypeDefinition] of Object.entries(
      typeDefinition.properties,
    )) {
      result[propertyName] = _replaceInContent(
        schema,
        value[propertyName],
        propertyTypeDefinition,
        documentIdMapping,
        collectionIdMapping,
      );
    }
    return result;
  }

  if (typeDefinition.dataType === DataType.List) {
    if (Array.isArray(value)) {
      return value.map((item) =>
        _replaceInContent(
          schema,
          item,
          typeDefinition.items,
          documentIdMapping,
          collectionIdMapping,
        ),
      );
    }
    return value;
  }

  return value;
}

export function makeProtoAppIdMapping(appIds: AppId[]): Map<ProtoAppId, AppId> {
  return new Map(
    appIds.map((appId, index) => [Id.generate.protoApp(index), appId]),
  );
}

/**
 * Replaces a proto app ID with the actual ID from the mapping.
 * Returns the original ID if it's not a proto ID or if it's not found in the
 * mapping.
 */
export function replaceProtoAppId(
  id: ProtoAppId | AppId | null,
  idMapping: Map<ProtoAppId, AppId>,
): AppId | null {
  if (id === null) {
    return null;
  }
  if (Id.is.protoApp(id)) {
    const mappedId = idMapping.get(id);
    if (mappedId) {
      return mappedId;
    }
  }
  return id as AppId;
}
