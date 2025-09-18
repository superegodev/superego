import {
  type AnyTypeDefinition,
  DataType,
  type Schema,
  utils,
} from "@superego/schema";

// TODO: we should define default values at the schema and format level.
export default function generateDefaultValues(schema: Schema) {
  return generateAnyDefaultValues(utils.getRootType(schema), schema);
}

// TODO: separate out into own file?
export function generateAnyDefaultValues(
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
            generateAnyDefaultValues(propertyTypeDefinition, schema),
          ],
        ),
      );
    case DataType.List:
      return [
        { value: generateAnyDefaultValues(typeDefinition.items, schema) },
      ];
    case null:
      return generateAnyDefaultValues(
        utils.getType(schema, typeDefinition),
        schema,
      );
  }
}
