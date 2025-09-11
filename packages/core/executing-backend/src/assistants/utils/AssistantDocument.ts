import type {
  Document,
  DocumentId,
  DocumentVersionId,
} from "@superego/backend";
import {
  type AnyTypeDefinition,
  DataType,
  FormatId,
  type Schema,
  utils,
} from "@superego/schema";
import { DateTime } from "luxon";

export default interface AssistantDocument {
  id: DocumentId;
  versionId: DocumentVersionId;
  /**
   * Content is converted for the assistant to:
   * - Use local Instants instead of UTC.
   */
  content: any;
}

export function toAssistantDocument(
  schema: Schema,
  document: Document,
  timeZone: string,
): AssistantDocument {
  return {
    id: document.id,
    versionId: document.latestVersion.id,
    content: toAssistantContent(
      schema,
      document.latestVersion.content,
      timeZone,
    ),
  };
}

export function toAssistantContent(
  schema: Schema,
  content: any,
  timeZone: string,
) {
  const rootType = utils.rootType(schema);
  return toAssistantValue(schema, content, rootType, timeZone);
}

function toAssistantValue(
  schema: Schema,
  value: any,
  typeDefinition: AnyTypeDefinition,
  timeZone: string,
): any {
  // Null is never converted.
  if (value === null) {
    return null;
  }

  // Recursions for refs, structs, and lists.
  if ("ref" in typeDefinition) {
    return toAssistantValue(
      schema,
      value,
      schema.types[typeDefinition.ref]!,
      timeZone,
    );
  }
  if (typeDefinition.dataType === DataType.Struct) {
    return Object.fromEntries(
      Object.entries(typeDefinition.properties).map(
        ([propertyName, propertyTypeDefinition]) => [
          propertyName,
          toAssistantValue(
            schema,
            value[propertyName],
            propertyTypeDefinition,
            timeZone,
          ),
        ],
      ),
    );
  }
  if (typeDefinition.dataType === DataType.List) {
    return (value as any[]).map((item) =>
      toAssistantValue(schema, item, typeDefinition.items, timeZone),
    );
  }

  // Values for which a conversion is needed.
  if (
    typeDefinition.dataType === DataType.String &&
    typeDefinition.format === FormatId.String.Instant
  ) {
    return DateTime.fromISO(value).setZone(timeZone).toISO();
  }

  // Value for which no conversion is needed.
  return value;
}

export function fromAssistantContent(schema: Schema, content: any) {
  const rootType = utils.rootType(schema);
  return fromAssistantValue(schema, content, rootType, false);
}

// Try to convert. If value doesn't match typeDefinition, don't convert. (It'll
// cause a validation error elsewhere.)
function fromAssistantValue(
  schema: Schema,
  // value was returned by the assistant, and as such it can only be a JSON
  // value: string, number, boolean, null, object, or array.
  value: any,
  typeDefinition: AnyTypeDefinition,
  isNullable: boolean,
): any {
  // Null is never converted.
  if (value === null) {
    return null;
  }

  // Convert undefined to null.
  if (value === undefined && isNullable) {
    return null;
  }

  // Recursions for refs, structs, and lists.
  if ("ref" in typeDefinition) {
    return fromAssistantValue(
      schema,
      value,
      schema.types[typeDefinition.ref]!,
      isNullable,
    );
  }
  if (Array.isArray(value) && typeDefinition.dataType === DataType.List) {
    return (value as any[]).map((item) =>
      fromAssistantValue(schema, item, typeDefinition.items, false),
    );
  }
  if (
    typeof value === "object" &&
    typeDefinition.dataType === DataType.Struct
  ) {
    return Object.fromEntries(
      Object.entries(value).map(([propertyName, propertyValue]) => [
        propertyName,
        // If there are superfluous properties, leave them in the object.
        typeDefinition.properties[propertyName]
          ? fromAssistantValue(
              schema,
              propertyValue,
              typeDefinition.properties[propertyName],
              typeDefinition.nullableProperties?.includes(propertyName) ??
                false,
            )
          : propertyValue,
      ]),
    );
  }

  // Values for which a conversion is needed.
  if (
    typeof value === "string" &&
    typeDefinition.dataType === DataType.String &&
    typeDefinition.format === FormatId.String.Instant
  ) {
    const parsedDate = DateTime.fromISO(value);
    return parsedDate.isValid ? parsedDate.toUTC().toISO() : value;
  }

  // Value for which no conversion is needed.
  return value;
}
