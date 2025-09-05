import type { JSONSchema7 } from "json-schema";

/**
 * Recursively traverses a JSON schema and strips all additionalProperties in
 * type=object schemas.
 */
function stripAdditionalProperties(schema: JSONSchema7): JSONSchema7 {
  // Shallow copy to avoid mutating the input schema
  const strippedSchema: JSONSchema7 = { ...schema };

  // Determine if the schema is for an object type
  const isObjectType =
    strippedSchema.type === "object" ||
    (Array.isArray(strippedSchema.type) &&
      strippedSchema.type.includes("object"));

  // Remove additionalProperties only for object-typed schemas
  if (isObjectType && "additionalProperties" in strippedSchema) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete (strippedSchema as any).additionalProperties;
  }

  // Recurse into known schema-composition keywords.
  if (strippedSchema.allOf) {
    strippedSchema.allOf = strippedSchema.allOf.map((sub) =>
      stripAdditionalProperties(sub as JSONSchema7),
    );
  }
  if (strippedSchema.anyOf) {
    strippedSchema.anyOf = strippedSchema.anyOf.map((sub) =>
      stripAdditionalProperties(sub as JSONSchema7),
    );
  }
  if (strippedSchema.oneOf) {
    strippedSchema.oneOf = strippedSchema.oneOf.map((sub) =>
      stripAdditionalProperties(sub as JSONSchema7),
    );
  }
  if (strippedSchema.not) {
    strippedSchema.not = stripAdditionalProperties(
      strippedSchema.not as JSONSchema7,
    );
  }

  // Conditional schemas.
  if (strippedSchema.if) {
    strippedSchema.if = stripAdditionalProperties(
      strippedSchema.if as JSONSchema7,
    );
  }
  if (strippedSchema.then) {
    // biome-ignore lint/suspicious/noThenProperty: JSONSchema keyword.
    strippedSchema.then = stripAdditionalProperties(
      strippedSchema.then as JSONSchema7,
    );
  }
  if (strippedSchema.else) {
    strippedSchema.else = stripAdditionalProperties(
      strippedSchema.else as JSONSchema7,
    );
  }

  // Object-related keywords.
  if (strippedSchema.properties) {
    strippedSchema.properties = Object.fromEntries(
      Object.entries(strippedSchema.properties).map(([key, def]) => [
        key,
        typeof def === "boolean" ? def : stripAdditionalProperties(def),
      ]),
    );
  }
  if (strippedSchema.patternProperties) {
    strippedSchema.patternProperties = Object.fromEntries(
      Object.entries(strippedSchema.patternProperties).map(([key, def]) => [
        key,
        typeof def === "boolean" ? def : stripAdditionalProperties(def),
      ]),
    );
  }
  if (strippedSchema.propertyNames) {
    strippedSchema.propertyNames = stripAdditionalProperties(
      strippedSchema.propertyNames as JSONSchema7,
    );
  }
  if (strippedSchema.dependencies) {
    strippedSchema.dependencies = Object.fromEntries(
      Object.entries(strippedSchema.dependencies).map(([key, dep]) => [
        key,
        typeof dep === "object" && dep !== null && !Array.isArray(dep)
          ? stripAdditionalProperties(dep as JSONSchema7)
          : dep,
      ]),
    );
  }

  // Array-related keywords.
  if (strippedSchema.items) {
    if (Array.isArray(strippedSchema.items)) {
      strippedSchema.items = strippedSchema.items.map((item) =>
        typeof item === "boolean" ? item : stripAdditionalProperties(item),
      );
    } else if (typeof strippedSchema.items === "object") {
      strippedSchema.items = stripAdditionalProperties(
        strippedSchema.items as JSONSchema7,
      );
    }
  }
  if (strippedSchema.contains) {
    strippedSchema.contains = stripAdditionalProperties(
      strippedSchema.contains as JSONSchema7,
    );
  }
  if (
    strippedSchema.additionalItems &&
    typeof strippedSchema.additionalItems === "object"
  ) {
    strippedSchema.additionalItems = stripAdditionalProperties(
      strippedSchema.additionalItems as JSONSchema7,
    );
  }

  // $defs
  if ((strippedSchema as any).$defs) {
    (strippedSchema as any).$defs = Object.fromEntries(
      Object.entries((strippedSchema as any).$defs).map(([key, def]) => [
        key,
        typeof def === "boolean"
          ? def
          : stripAdditionalProperties(def as JSONSchema7),
      ]),
    );
  }

  return strippedSchema;
}

export default { stripAdditionalProperties };
