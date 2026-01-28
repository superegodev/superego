import {
  type AnyTypeDefinition,
  DataType,
  type Schema,
  utils as schemaUtils,
} from "@superego/schema";
import pMap from "p-map";

export default {
  async fromRHFContent(rhfContent: any, schema: Schema): Promise<any> {
    return fromRHFValue(rhfContent, schemaUtils.getRootType(schema), schema);
  },

  toRHFContent(content: any, schema: Schema): any {
    return toRHFValue(content, schemaUtils.getRootType(schema), schema);
  },
};

async function fromRHFValue(
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
    case DataType.DocumentRef:
      return rhfValue;
    case DataType.File:
      // FileRefs are kept as is. RHFProtoFiles are converted to ProtoFiles.
      return "id" in rhfValue
        ? rhfValue
        : schemaUtils.RHFProtoFile.fromRHFProtoFile(rhfValue);
    case DataType.Struct:
      return Object.fromEntries(
        await pMap(
          Object.entries(typeDefinition.properties),
          async ([propertyName, propertyTypeDefinition]) => [
            propertyName,
            await fromRHFValue(
              rhfValue[propertyName],
              propertyTypeDefinition,
              schema,
            ),
          ],
        ),
      );
    case DataType.List:
      return pMap(
        rhfValue,
        async (item: { value: any }) =>
          await fromRHFValue(item.value, typeDefinition.items, schema),
      );
    case null:
      return fromRHFValue(
        rhfValue,
        schemaUtils.getType(schema, typeDefinition),
        schema,
      );
  }
}

function toRHFValue(
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
    case DataType.StringLiteral:
    case DataType.NumberLiteral:
    case DataType.BooleanLiteral:
    case DataType.DocumentRef:
      return value;
    case DataType.File:
      // ProtoFiles are converted to RHFProtoFiles. FileRefs are kept as is.
      return "id" in value
        ? value
        : schemaUtils.RHFProtoFile.toRHFProtoFile(value);
    case DataType.Struct:
      return Object.fromEntries(
        Object.entries(typeDefinition.properties).map(
          ([propertyName, propertyTypeDefinition]) => [
            propertyName,
            toRHFValue(value[propertyName], propertyTypeDefinition, schema),
          ],
        ),
      );
    case DataType.List:
      return value.map((item: any) => ({
        value: toRHFValue(item, typeDefinition.items, schema),
      }));
    case null:
      return toRHFValue(
        value,
        schemaUtils.getType(schema, typeDefinition),
        schema,
      );
  }
}
