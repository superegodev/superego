import type { JSONSchema7 } from "json-schema";
import identifierRegex from "./valibot-schemas/identifier/identifierRegex.js";
import mimeTypeRegex from "./valibot-schemas/mimeType/mimeTypeRegex.js";
import mimeTypeMatcherRegex from "./valibot-schemas/mimeTypeMatcher/mimeTypeMatcherRegex.js";

export default {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://superego.dev/json-schemas/schema.json",
  title: "Schema",
  type: "object",
  properties: {
    types: {
      description: "A map of type names to their definitions.",
      type: "object",
      patternProperties: {
        [identifierRegex.source]: { $ref: "#/$defs/AnyTypeDefinition" },
      },
      additionalProperties: false,
    },
    rootType: {
      description:
        "Name of the root type. Must be a key in 'types'. Must be a StructTypeDefinition.",
      type: "string",
    },
  },
  required: ["types", "rootType"],
  additionalProperties: false,
  $defs: {
    StringTypeDefinition: {
      type: "object",
      properties: {
        description: { type: "string" },
        dataType: { const: "String" },
        format: { type: "string" },
      },
      required: ["dataType"],
      additionalProperties: false,
    },

    EnumMember: {
      type: "object",
      properties: {
        description: { type: "string" },
        value: { type: "string" },
      },
      required: ["value"],
      additionalProperties: false,
    },

    EnumTypeDefinition: {
      type: "object",
      properties: {
        description: { type: "string" },
        dataType: { const: "Enum" },
        members: {
          type: "object",
          patternProperties: {
            [identifierRegex.source]: { $ref: "#/$defs/EnumMember" },
          },
          additionalProperties: false,
        },
      },
      required: ["dataType", "members"],
      additionalProperties: false,
    },

    NumberTypeDefinition: {
      type: "object",
      properties: {
        description: { type: "string" },
        dataType: { const: "Number" },
        format: { type: "string" },
      },
      required: ["dataType"],
      additionalProperties: false,
    },

    BooleanTypeDefinition: {
      type: "object",
      properties: {
        description: { type: "string" },
        dataType: { const: "Boolean" },
      },
      required: ["dataType"],
      additionalProperties: false,
    },

    StringLiteralTypeDefinition: {
      type: "object",
      properties: {
        description: { type: "string" },
        dataType: { const: "StringLiteral" },
        value: { type: "string" },
      },
      required: ["dataType", "value"],
      additionalProperties: false,
    },

    NumberLiteralTypeDefinition: {
      type: "object",
      properties: {
        description: { type: "string" },
        dataType: { const: "NumberLiteral" },
        value: { type: "number" },
      },
      required: ["dataType", "value"],
      additionalProperties: false,
    },

    BooleanLiteralTypeDefinition: {
      type: "object",
      properties: {
        description: { type: "string" },
        dataType: { const: "BooleanLiteral" },
        value: { type: "boolean" },
      },
      required: ["dataType", "value"],
      additionalProperties: false,
    },

    JsonObjectTypeDefinition: {
      type: "object",
      properties: {
        description: { type: "string" },
        dataType: { const: "JsonObject" },
        format: { type: "string" },
      },
      required: ["dataType"],
      additionalProperties: false,
    },

    AcceptedFileExtensions: {
      description:
        "Either '*' (all extensions) or a list of accepted extensions.",
      examples: [".png", ".jpg"],
      oneOf: [
        { const: "*" },
        {
          type: "array",
          items: { type: "string", pattern: mimeTypeRegex.source },
        },
      ],
    },

    FileTypeDefinition: {
      type: "object",
      properties: {
        description: { type: "string" },
        dataType: { const: "File" },
        accept: {
          description: `
Object specifying which mime types, and for each mime type which extensions, are
accepted.

The object's keys are _mime type matchers_: glob-like strings matching one or
more mime types. Examples:

- \`image/png\` matches only the mime type \`image/png\`.
- \`image/*\` matches all mime types like \`image/png\`, \`image/jpg\`, etc.

The object values are _accepted file extensions_, which are either:

- The \`*\` string, which accepts all extensions.
- An array of extensions, which accepts only the exact extensions listed.
          `.trim(),
          examples: [{ "image/*": [".png", ".jpg"], "text/plain": "*" }],
          type: "object",
          patternProperties: {
            [mimeTypeMatcherRegex.source]: {
              $ref: "#/$defs/AcceptedFileExtensions",
            },
          },
          additionalProperties: false,
        },
      },
      required: ["dataType"],
      additionalProperties: false,
    },

    StructTypeDefinition: {
      type: "object",
      properties: {
        description: { type: "string" },
        dataType: { const: "Struct" },
        properties: {
          type: "object",
          patternProperties: {
            [identifierRegex.source]: { $ref: "#/$defs/AnyTypeDefinition" },
          },
          additionalProperties: false,
        },
        nullableProperties: {
          type: "array",
          items: { type: "string" },
          uniqueItems: true,
        },
      },
      required: ["dataType", "properties"],
      additionalProperties: false,
    },

    ListTypeDefinition: {
      type: "object",
      properties: {
        description: { type: "string" },
        dataType: { const: "List" },
        items: { $ref: "#/$defs/AnyTypeDefinition" },
      },
      required: ["dataType", "items"],
      additionalProperties: false,
    },

    TypeDefinitionRef: {
      type: "object",
      properties: {
        description: { type: "string" },
        dataType: { const: null },
        ref: { type: "string" },
      },
      required: ["dataType", "ref"],
      additionalProperties: false,
    },

    AnyTypeDefinition: {
      oneOf: [
        { $ref: "#/$defs/StringTypeDefinition" },
        { $ref: "#/$defs/NumberTypeDefinition" },
        { $ref: "#/$defs/EnumTypeDefinition" },
        { $ref: "#/$defs/BooleanTypeDefinition" },
        { $ref: "#/$defs/StringLiteralTypeDefinition" },
        { $ref: "#/$defs/NumberLiteralTypeDefinition" },
        { $ref: "#/$defs/BooleanLiteralTypeDefinition" },
        { $ref: "#/$defs/JsonObjectTypeDefinition" },
        { $ref: "#/$defs/FileTypeDefinition" },
        { $ref: "#/$defs/StructTypeDefinition" },
        { $ref: "#/$defs/ListTypeDefinition" },
        { $ref: "#/$defs/TypeDefinitionRef" },
      ],
    },
  },
} satisfies JSONSchema7;
