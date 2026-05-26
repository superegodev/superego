import { SchemaJsonSchema } from "@superego/schema";
import { toJsonSchema, type JsonSchema } from "@valibot/to-json-schema";
import * as v from "valibot";

export function getJsonSchemaHelp(
  schema: v.GenericSchema<unknown, unknown>,
): JsonSchema {
  try {
    const jsonSchema = improveJsonSchema(
      toJsonSchema(sanitizeSchemaForJsonSchema(schema), {
        target: "draft-2020-12",
        typeMode: "input",
        errorMode: "ignore",
      }),
    );
    return stripSchemaMetadata(jsonSchema);
  } catch (error) {
    return {
      description: `JSON Schema conversion failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

export function improveJsonSchema(schema: JsonSchema): JsonSchema {
  if (isValibotGeneratedSchemaJsonSchema(schema)) {
    return stripSchemaMetadata(SchemaJsonSchema as JsonSchema);
  }
  if (Array.isArray(schema)) {
    return schema.map((item) =>
      typeof item === "object" && item !== null
        ? improveJsonSchema(item as JsonSchema)
        : item,
    ) as JsonSchema;
  }
  if (typeof schema !== "object" || schema === null) {
    return schema;
  }

  return Object.fromEntries(
    Object.entries(schema).map(([key, value]) => [
      key,
      typeof value === "object" && value !== null
        ? improveJsonSchema(value as JsonSchema)
        : value,
    ]),
  ) as JsonSchema;
}

function sanitizeSchemaForJsonSchema(
  schema: v.GenericSchema<unknown, unknown>,
): v.GenericSchema<unknown, unknown> {
  const schemaInternals = schema as any;
  switch (schemaInternals.type) {
    case "custom":
      return v.string();
    case "lazy":
      return v.any();
    case "array":
      return v.array(sanitizeSchemaForJsonSchema(schemaInternals.item));
    case "optional":
      return v.optional(sanitizeSchemaForJsonSchema(schemaInternals.wrapped));
    case "nullable":
      return v.nullable(sanitizeSchemaForJsonSchema(schemaInternals.wrapped));
    case "strict_object":
      return v.strictObject(sanitizeEntries(schemaInternals.entries));
    case "object":
      return v.object(sanitizeEntries(schemaInternals.entries));
    case "loose_object":
      return v.looseObject(sanitizeEntries(schemaInternals.entries));
    case "record":
      return v.record(
        sanitizeSchemaForJsonSchema(schemaInternals.key) as v.GenericSchema<
          string,
          string
        >,
        sanitizeSchemaForJsonSchema(schemaInternals.value),
      );
    case "tuple":
      return v.tuple(schemaInternals.items.map(sanitizeSchemaForJsonSchema));
    case "union":
      return v.union(schemaInternals.options.map(sanitizeSchemaForJsonSchema));
    default:
      return schema;
  }
}

function sanitizeEntries(
  entries: Record<string, v.GenericSchema<unknown, unknown>>,
) {
  return Object.fromEntries(
    Object.entries(entries).map(([key, value]) => [
      key,
      sanitizeSchemaForJsonSchema(value),
    ]),
  );
}

function isValibotGeneratedSchemaJsonSchema(schema: JsonSchema): boolean {
  return (
    typeof schema === "object" &&
    schema !== null &&
    "type" in schema &&
    schema.type === "object" &&
    "properties" in schema &&
    typeof schema.properties === "object" &&
    schema.properties !== null &&
    "types" in schema.properties &&
    "rootType" in schema.properties
  );
}

function stripSchemaMetadata(schema: JsonSchema): JsonSchema {
  const { $schema: _schema, $id: _id, ...schemaWithoutMetadata } = schema;
  return schemaWithoutMetadata;
}
