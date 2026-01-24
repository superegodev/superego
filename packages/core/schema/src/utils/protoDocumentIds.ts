import DataType from "../DataType.js";
import type Schema from "../Schema.js";
import type { AnyTypeDefinition } from "../typeDefinitions.js";
import getRootType from "./getRootType.js";
import getType from "./getType.js";

const PROTO_DOCUMENT_ID_PREFIX = "ProtoDocument_";

export function makeProtoDocumentId(index: number): string {
  return `${PROTO_DOCUMENT_ID_PREFIX}${index}`;
}

export function makeProtoDocumentIdMapping(
  actualIds: string[],
): Map<string, string> {
  const mapping = new Map<string, string>();
  for (let i = 0; i < actualIds.length; i++) {
    const id = actualIds[i];
    if (id !== undefined) {
      mapping.set(makeProtoDocumentId(i), id);
    }
  }
  return mapping;
}

export function isProtoDocumentId(id: string): boolean {
  return id.startsWith(PROTO_DOCUMENT_ID_PREFIX);
}

export function parseProtoDocumentIndex(id: string): number | null {
  if (!isProtoDocumentId(id)) {
    return null;
  }
  const indexStr = id.slice(PROTO_DOCUMENT_ID_PREFIX.length);
  const index = Number.parseInt(indexStr, 10);
  return !Number.isNaN(index) && index >= 0 ? index : null;
}

/**
 * Extracts all proto document ID placeholders from DocumentRef values
 * in the given content.
 */
export function extractProtoDocumentIds(
  schema: Schema,
  content: any,
): string[] {
  const protoIds = new Set<string>();
  _extractFromContent(schema, content, getRootType(schema), protoIds);
  return Array.from(protoIds);
}

function _extractFromContent(
  schema: Schema,
  value: any,
  typeDefinition: AnyTypeDefinition,
  protoIds: Set<string>,
): void {
  if (value === null || value === undefined) {
    return;
  }

  if ("ref" in typeDefinition) {
    _extractFromContent(
      schema,
      value,
      getType(schema, typeDefinition),
      protoIds,
    );
    return;
  }

  if (typeDefinition.dataType === DataType.DocumentRef) {
    if (
      typeof value === "object" &&
      typeof value.documentId === "string" &&
      isProtoDocumentId(value.documentId)
    ) {
      protoIds.add(value.documentId);
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
        protoIds,
      );
    }
    return;
  }

  if (typeDefinition.dataType === DataType.List) {
    if (Array.isArray(value)) {
      for (const item of value) {
        _extractFromContent(schema, item, typeDefinition.items, protoIds);
      }
    }
  }
}

/**
 * Returns new content with all proto document ID placeholders replaced with
 * actual document IDs from the provided mapping.
 */
export function replaceProtoDocumentIds(
  schema: Schema,
  content: any,
  idMapping: Map<string, string>,
): any {
  return _replaceInContent(schema, content, getRootType(schema), idMapping);
}

function _replaceInContent(
  schema: Schema,
  value: any,
  typeDefinition: AnyTypeDefinition,
  idMapping: Map<string, string>,
): any {
  if (value === null || value === undefined) {
    return value;
  }

  if ("ref" in typeDefinition) {
    return _replaceInContent(
      schema,
      value,
      getType(schema, typeDefinition),
      idMapping,
    );
  }

  if (typeDefinition.dataType === DataType.DocumentRef) {
    if (
      typeof value === "object" &&
      typeof value.documentId === "string" &&
      isProtoDocumentId(value.documentId)
    ) {
      const actualId = idMapping.get(value.documentId);
      if (actualId) {
        return { ...value, documentId: actualId };
      }
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
        idMapping,
      );
    }
    return result;
  }

  if (typeDefinition.dataType === DataType.List) {
    if (Array.isArray(value)) {
      return value.map((item) =>
        _replaceInContent(schema, item, typeDefinition.items, idMapping),
      );
    }
    return value;
  }

  return value;
}
