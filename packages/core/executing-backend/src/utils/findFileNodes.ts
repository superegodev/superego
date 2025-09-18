import {
  type AnyTypeDefinition,
  DataType,
  type FileRef,
  type ProtoFile,
  type Schema,
  utils,
} from "@superego/schema";

export interface FileNode {
  path: string[];
  value: FileRef | ProtoFile;
}

/**
 * Finds all nodes in the given value (a struct, a list, or a primitive) that
 * are either FileRefs or ProtoFiles. These nodes are called "file nodes".
 *
 * Things to note:
 *
 * - The function assumes that the value abides by the passed-in schema.
 * - The function only searches for file nodes "in places where the schema
 *   allows them to be". Example: if a property of a struct contains a
 *   JsonObject compatible with a FileRef, this function won't consider it a
 *   file node.
 */
export default function findFileNodes(schema: Schema, value: any): FileNode[] {
  return _findFileNodes(schema, value, utils.getRootType(schema), []);
}

// "Private" version of findFileNodes with additional arguments which we don't
// want to expose in the "public" version.
function _findFileNodes(
  schema: Schema,
  value: any,
  typeDefinition: AnyTypeDefinition,
  parentPath: string[] = [],
): FileNode[] {
  if (value === null) {
    return [];
  }
  if ("ref" in typeDefinition) {
    return _findFileNodes(
      schema,
      value,
      utils.getType(schema, typeDefinition),
      parentPath,
    );
  }
  if (typeDefinition.dataType === DataType.File) {
    return [{ path: parentPath, value: value }];
  }
  if (typeDefinition.dataType === DataType.Struct) {
    return Object.entries(typeDefinition.properties).flatMap(
      ([propertyName, propertyTypeDefinition]) =>
        _findFileNodes(schema, value[propertyName], propertyTypeDefinition, [
          ...parentPath,
          propertyName,
        ]),
    );
  }
  if (typeDefinition.dataType === DataType.List) {
    return (value as any[]).flatMap((item, index) =>
      _findFileNodes(schema, item, typeDefinition.items, [
        ...parentPath,
        index.toString(),
      ]),
    );
  }
  return [];
}
