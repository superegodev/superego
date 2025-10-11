import {
  type AnyTypeDefinition,
  DataType,
  type Schema,
  utils,
} from "@superego/schema";

export default function typeDefinitionValue(
  typeDefinition: AnyTypeDefinition,
  schema: Schema,
): any {
  switch (typeDefinition.dataType) {
    case DataType.String:
    case DataType.Enum:
    case DataType.Number:
    case DataType.Boolean:
    case DataType.JsonObject:
    case DataType.File:
      return null;
    case DataType.StringLiteral:
    case DataType.NumberLiteral:
    case DataType.BooleanLiteral:
      return typeDefinition.value;
    case DataType.Struct:
      return Object.fromEntries(
        Object.entries(typeDefinition.properties).map(
          ([propertyName, propertyTypeDefinition]) => [
            propertyName,
            typeDefinitionValue(propertyTypeDefinition, schema),
          ],
        ),
      );
    case DataType.List:
      return [{ value: typeDefinitionValue(typeDefinition.items, schema) }];
    case null:
      return typeDefinitionValue(utils.getType(schema, typeDefinition), schema);
  }
}
