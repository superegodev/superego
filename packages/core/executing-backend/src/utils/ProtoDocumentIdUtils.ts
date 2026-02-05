import type { DocumentId, ProtoDocumentId } from "@superego/backend";
import {
  type AnyTypeDefinition,
  DataType,
  type Schema,
  utils,
} from "@superego/schema";
import { Id } from "@superego/shared-utils";

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
 * Extracts all proto document ID placeholders from DocumentRef values
 * in the given content.
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
 * Returns new content with all proto document ID placeholders replaced with
 * document IDs from the provided mapping.
 */
export function replaceProtoDocumentIds(
  schema: Schema,
  content: any,
  idMapping: Map<ProtoDocumentId, DocumentId>,
): any {
  return _replaceInContent(
    schema,
    content,
    utils.getRootType(schema),
    idMapping,
  );
}

function _replaceInContent(
  schema: Schema,
  value: any,
  typeDefinition: AnyTypeDefinition,
  idMapping: Map<ProtoDocumentId, DocumentId>,
): any {
  if (value === null || value === undefined) {
    return value;
  }

  if ("ref" in typeDefinition) {
    return _replaceInContent(
      schema,
      value,
      utils.getType(schema, typeDefinition),
      idMapping,
    );
  }

  if (typeDefinition.dataType === DataType.DocumentRef) {
    if (
      typeof value === "object" &&
      typeof value.documentId === "string" &&
      Id.is.protoDocument(value.documentId)
    ) {
      const documentId = idMapping.get(value.documentId);
      if (documentId) {
        return { ...value, documentId };
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
