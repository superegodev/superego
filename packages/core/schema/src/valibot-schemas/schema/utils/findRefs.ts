import DataType from "../../../DataType.js";
import type Schema from "../../../Schema.js";
import type { AnyTypeDefinition } from "../../../typeDefinitions.js";

interface Ref {
  ref: string;
  path: ["types", string, ...string[]];
}

export default function findRefs(schema: Schema): Ref[] {
  return Object.entries(schema.types).flatMap(([typeName, typeDefinition]) =>
    findTypeDefinitionRefs(typeDefinition, ["types", typeName]),
  );
}

function findTypeDefinitionRefs(
  typeDefinition: AnyTypeDefinition,
  parentPath: Ref["path"],
): Ref[] {
  if ("ref" in typeDefinition) {
    return [{ ref: typeDefinition.ref, path: [...parentPath, "ref"] }];
  }
  if (typeDefinition.dataType === DataType.Struct) {
    return Object.entries(typeDefinition.properties).flatMap(
      ([propertyName, propertyTypeDefinition]) =>
        findTypeDefinitionRefs(propertyTypeDefinition, [
          ...parentPath,
          "properties",
          propertyName,
        ]),
    );
  }
  if (typeDefinition.dataType === DataType.List) {
    return findTypeDefinitionRefs(typeDefinition.items, [
      ...parentPath,
      "items",
    ]);
  }
  return [];
}
