import {
  type AnyTypeDefinition,
  DataType,
  FormatId,
  type Schema,
  utils,
} from "@superego/schema";
import { DateTime } from "luxon";

export default function typeDefinitionValue(
  typeDefinition: AnyTypeDefinition,
  schema: Schema,
): any {
  switch (typeDefinition.dataType) {
    case DataType.String: {
      switch (typeDefinition.format) {
        case FormatId.String.PlainDate:
          return DateTime.now().toISODate();
        case FormatId.String.PlainTime:
          return DateTime.now().toISOTime({
            includeOffset: false,
            suppressMilliseconds: false,
          });
        case FormatId.String.Instant:
          return DateTime.now().toISO({
            includeOffset: true,
            suppressMilliseconds: false,
          });
        default:
          return "";
      }
    }
    case DataType.Number:
      return 0;
    case DataType.Boolean:
      return false;
    case DataType.Enum: {
      const firstMemberName =
        typeDefinition.membersOrder?.[0] ??
        Object.keys(typeDefinition.members)[0];
      const firstMember =
        firstMemberName !== undefined
          ? typeDefinition.members[firstMemberName]
          : undefined;
      return firstMember?.value ?? null;
    }
    case DataType.JsonObject:
    case DataType.File:
    case DataType.DocumentRef:
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
            typeDefinition.nullableProperties?.includes(propertyName)
              ? null
              : typeDefinitionValue(propertyTypeDefinition, schema),
          ],
        ),
      );
    case DataType.List:
      return [{ value: typeDefinitionValue(typeDefinition.items, schema) }];
    case null:
      return typeDefinitionValue(utils.getType(schema, typeDefinition), schema);
    // Triggers a TypeScript error if a new DataType is added but not handled
    // above.
    default: {
      const _exhaustiveCheck: never = typeDefinition;
      void _exhaustiveCheck;
      return null;
    }
  }
}
