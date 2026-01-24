import {
  type AnyTypeDefinition,
  DataType,
  type Schema,
  utils,
} from "@superego/schema";
import pMap from "p-map";

export default {
  async fromRHFContent(rhfContent: any, schema: Schema): Promise<any> {
    return fromRHFValue(rhfContent, utils.getRootType(schema), schema);
  },

  toRHFContent(content: any, schema: Schema): any {
    return toRHFValue(content, utils.getRootType(schema), schema);
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
      // FileRefs are kept as is. Files are converted to ProtoFiles.
      return "id" in rhfValue
        ? rhfValue
        : {
            name: rhfValue.name,
            mimeType: rhfValue.type,
            content: new Uint8Array(await rhfValue.arrayBuffer()),
          };
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
        utils.getType(schema, typeDefinition),
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
      // ProtoFiles are converted to Files. FileRefs are kept as is.
      return "id" in value
        ? value
        : new File([value.content], value.name, { type: value.mimeType });
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
      return toRHFValue(value, utils.getType(schema, typeDefinition), schema);
  }
}
