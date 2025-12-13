import {
  type AnyTypeDefinition,
  DataType,
  type Schema,
  utils,
} from "@superego/schema";
import pMap from "p-map";

export default {
  async fromRHFContent(rhfContent: any, schema: Schema): Promise<any> {
    return fromRhfValue(rhfContent, utils.getRootType(schema), schema);
  },

  toRHFContent(content: any, schema: Schema): any {
    return toRhfValue(content, utils.getRootType(schema), schema);
  },
};

async function fromRhfValue(
  rhfValue: any,
  typeDefinition: AnyTypeDefinition,
  schema: Schema,
): Promise<any> {
  if (rhfValue === null) {
    return rhfValue;
  }
  switch (typeDefinition.dataType) {
    case DataType.String:
    case DataType.Enum:
    case DataType.Number:
    case DataType.Boolean:
    case DataType.JsonObject:
    case DataType.StringLiteral:
    case DataType.NumberLiteral:
    case DataType.BooleanLiteral:
      return rhfValue;
    case DataType.File:
      return {
        ...rhfValue,
        content: new Uint8Array(await rhfValue.content.arrayBuffer()),
      };
    case DataType.Struct:
      return Object.fromEntries(
        await pMap(
          Object.entries(typeDefinition.properties),
          async ([propertyName, propertyTypeDefinition]) => [
            propertyName,
            await fromRhfValue(
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
