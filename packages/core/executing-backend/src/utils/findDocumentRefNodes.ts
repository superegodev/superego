import {
  type AnyTypeDefinition,
  DataType,
  type DocumentRef,
  type Schema,
  utils,
} from "@superego/schema";

export interface DocumentRefNode {
  path: string[];
  value: DocumentRef;
}

/**
 * Finds all nodes in the given value (a struct, a list, or a primitive) that
 * are DocumentRefs. These nodes are called "document ref nodes".
 *
 * Things to note:
 *
 * - The function assumes that the value abides by the passed-in schema.
 * - The function only searches for document ref nodes "in places where the
 *   schema allows them to be". Example: if a property of a struct contains a
 *   JsonObject compatible with a DocumentRef, this function won't consider it a
 *   document ref node.
 */
export default function findDocumentRefNodes(
  schema: Schema,
  value: any,
): DocumentRefNode[] {
  return _findDocumentRefNodes(schema, value, utils.getRootType(schema), []);
}

// "Private" version of findDocumentRefNodes with additional arguments which we
// don't want to expose in the "public" version.
function _findDocumentRefNodes(
  schema: Schema,
  value: any,
  typeDefinition: AnyTypeDefinition,
  parentPath: string[] = [],
): DocumentRefNode[] {
  if (value === null) {
    return [];
  }
  if ("ref" in typeDefinition) {
    return _findDocumentRefNodes(
      schema,
      value,
      utils.getType(schema, typeDefinition),
      parentPath,
    );
  }
  if (typeDefinition.dataType === DataType.DocumentRef) {
    return [{ path: parentPath, value: value }];
  }
  if (typeDefinition.dataType === DataType.Struct) {
    return Object.entries(typeDefinition.properties).flatMap(
      ([propertyName, propertyTypeDefinition]) =>
        _findDocumentRefNodes(
          schema,
          value[propertyName],
          propertyTypeDefinition,
          [...parentPath, propertyName],
        ),
    );
  }
  if (typeDefinition.dataType === DataType.List) {
    return (value as any[]).flatMap((item, index) =>
      _findDocumentRefNodes(schema, item, typeDefinition.items, [
        ...parentPath,
        index.toString(),
      ]),
    );
  }
  return [];
}
