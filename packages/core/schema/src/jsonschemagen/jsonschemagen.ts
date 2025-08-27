import type { JSONSchema7, JSONSchema7Type } from "json-schema";
import DataType from "../DataType.js";
import formats from "../formats/formats.js";
import type Schema from "../Schema.js";
import type { AnyTypeDefinition } from "../typeDefinitions.js";
import findFormat from "../utils/findFormat.js";
import joinLines from "../utils/joinLines.js";
import generateBuiltInTypesDefs from "./generateBuiltInTypesDefs.js";
import type ReferencedBuiltInTypes from "./ReferencedBuiltInTypes.js";

function generateDescription(
  typeDefinition: AnyTypeDefinition,
): string | undefined {
  const lines: string[] = [];
  if (typeDefinition.description) {
    lines.push(typeDefinition.description);
  }
  if ("format" in typeDefinition) {
    const format = findFormat(typeDefinition, formats);
    if (format) {
      lines.push("", `Format \`${format.id}\`:`, "", format.description.en);
    }
  }
  if (typeDefinition.dataType === DataType.Enum) {
    lines.push(
      "",
      "Enum members descriptions:",
      "",
      ...Object.values(typeDefinition.members).map(
        (member) => `- ${member.value}: ${member.description}`,
      ),
    );
  }
  return lines.length > 0 ? joinLines(lines).trim() : undefined;
}

function generateExamples(
  typeDefinition: AnyTypeDefinition,
): JSONSchema7Type | undefined {
  return "format" in typeDefinition
    ? (findFormat(typeDefinition, formats)?.validExamples ?? undefined)
    : undefined;
}

function generateDefinition(
  typeDefinition: AnyTypeDefinition,
  typeName: string | undefined,
  isNullable: boolean,
  schema: Schema,
  referencedBuiltInTypes: ReferencedBuiltInTypes,
): JSONSchema7 {
  const baseDefinition = {
    title: typeName,
    description: generateDescription(typeDefinition),
    examples: generateExamples(typeDefinition),
  };
  switch (typeDefinition.dataType) {
    case DataType.String:
      return {
        ...baseDefinition,
        type: isNullable ? ["string", "null"] : "string",
      };
    case DataType.Enum: {
      const values = Object.values(typeDefinition.members).map(
        ({ value }) => value,
      );
      return {
        ...baseDefinition,
        type: isNullable ? ["string", "null"] : "string",
        enum: isNullable ? [...values, null] : values,
      };
    }
    case DataType.Number:
      return {
        ...baseDefinition,
        type: isNullable ? ["number", "null"] : "number",
      };
    case DataType.Boolean:
      return {
        ...baseDefinition,
        type: isNullable ? ["boolean", "null"] : "boolean",
      };
    case DataType.StringLiteral:
      return {
        ...baseDefinition,
        type: isNullable ? ["string", "null"] : "string",
        const: typeDefinition.value,
      };
    case DataType.NumberLiteral:
      return {
        ...baseDefinition,
        type: isNullable ? ["number", "null"] : "number",
        const: typeDefinition.value,
      };
    case DataType.BooleanLiteral:
      return {
        ...baseDefinition,
        type: isNullable ? ["boolean", "null"] : "boolean",
        const: typeDefinition.value,
      };
    case DataType.JsonObject:
      referencedBuiltInTypes.add("JsonObject");
      return isNullable
        ? {
            ...baseDefinition,
            anyOf: [{ $ref: "#/$defs/JsonObject" }, { type: "null" }],
          }
        : { ...baseDefinition, $ref: "#/$defs/JsonObject" };
    case DataType.File:
      referencedBuiltInTypes.add("File");
      return isNullable
        ? {
            ...baseDefinition,
            anyOf: [
              { $ref: "#/$defs/ProtoFile" },
              { $ref: "#/$defs/FileRef" },
              { type: "null" },
            ],
          }
        : {
            ...baseDefinition,
            anyOf: [{ $ref: "#/$defs/ProtoFile" }, { $ref: "#/$defs/FileRef" }],
          };
    case DataType.Struct: {
      return {
        ...baseDefinition,
        type: isNullable ? ["object", "null"] : "object",
        properties: Object.fromEntries(
          Object.entries(typeDefinition.properties).map(
            ([propertyName, propertyTypeDefinition]) => [
              propertyName,
              generateDefinition(
                propertyTypeDefinition,
                undefined,
                typeDefinition.nullableProperties?.includes(propertyName) ??
                  false,
                schema,
                referencedBuiltInTypes,
              ),
            ],
          ),
        ),
        additionalProperties: false,
        required: Object.keys(typeDefinition.properties),
      };
    }
    case DataType.List: {
      return {
        ...baseDefinition,
        type: isNullable ? ["array", "null"] : "array",
        items: generateDefinition(
          typeDefinition.items,
          undefined,
          false,
          schema,
          referencedBuiltInTypes,
        ),
      };
    }
    case null:
      return isNullable
        ? {
            ...baseDefinition,
            anyOf: [
              { $ref: `#/$defs/${typeDefinition.ref}` },
              { type: "null" },
            ],
          }
        : { ...baseDefinition, $ref: `#/$defs/${typeDefinition.ref}` };
  }
}

export default function jsonschemagen(
  schema: Schema,
): JSONSchema7 & { type: "object" } {
  const referencedBuiltInTypes: ReferencedBuiltInTypes = new Set();
  const jsonSchema: JSONSchema7 = {
    $defs: {},
  };
  Object.entries(schema.types).forEach(([typeName, typeDefinition]) => {
    const definition = generateDefinition(
      typeDefinition,
      typeName,
      false,
      schema,
      referencedBuiltInTypes,
    );
    if (typeName === schema.rootType) {
      Object.assign(jsonSchema, definition);
    } else {
      jsonSchema.$defs![typeName] = definition;
    }
  });
  Object.assign(
    jsonSchema.$defs!,
    generateBuiltInTypesDefs(referencedBuiltInTypes),
  );
  return jsonSchema as JSONSchema7 & { type: "object" };
}
