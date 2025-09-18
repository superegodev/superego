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

function toAssistantContent(schema: Schema, content: any, timeZone: string) {
  const rootType = utils.getRootType(schema);
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
      utils.getType(schema, typeDefinition),
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
