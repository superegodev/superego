import {
  type AnyTypeDefinition,
  DataType,
  type Schema,
  utils,
} from "@superego/schema";

export default {
  fromRhfContent(rhfContent: any, schema: Schema): any {
    return fromRhfValue(rhfContent, utils.getRootType(schema), schema);
  },
  toRhfContent(content: any, schema: Schema): any {
    return toRhfValue(content, utils.getRootType(schema), schema);
  },
};

function fromRhfValue(
  rhfValue: any,
  typeDefinition: AnyTypeDefinition,
  schema: Schema,
): any {
  if (rhfValue === null) {
    return rhfValue;
  }
  switch (typeDefinition.dataType) {
    case DataType.String:
    case DataType.Enum:
    case DataType.Number:
    case DataType.Boolean:
    case DataType.JsonObject:
    case DataType.File:
    case DataType.StringLiteral:
    case DataType.NumberLiteral:
    case DataType.BooleanLiteral:
      return rhfValue;
    case DataType.Struct:
      return Object.fromEntries(
        Object.entries(typeDefinition.properties).map(
          ([propertyName, propertyTypeDefinition]) => [
            propertyName,
            fromRhfValue(
              rhfValue[propertyName],
              propertyTypeDefinition,
              schema,
            ),
          ],
        ),
      );
    case DataType.List:
      return rhfValue.map((item: { value: any }) => item.value);
    case null:
      return fromRhfValue(
        rhfValue,
        utils.getType(schema, typeDefinition),
        schema,
      );
  }
}

function toRhfValue(
  value: any,
  typeDefinition: AnyTypeDefinition,
  schema: Schema,
): any {
  if (value === null) {
    return value;
  }
  switch (typeDefinition.dataType) {
    case DataType.String:
    case DataType.Enum:
    case DataType.Number:
    case DataType.Boolean:
    case DataType.JsonObject:
    case DataType.File:
    case DataType.StringLiteral:
    case DataType.NumberLiteral:
    case DataType.BooleanLiteral:
      return value;
    case DataType.Struct:
      return Object.fromEntries(
        Object.entries(typeDefinition.properties).map(
          ([propertyName, propertyTypeDefinition]) => [
            propertyName,
            toRhfValue(value[propertyName], propertyTypeDefinition, schema),
          ],
        ),
      );
    case DataType.List:
      return value.map((item: any) => ({ value: item }));
    case null:
      return toRhfValue(value, utils.getType(schema, typeDefinition), schema);
  }
}
