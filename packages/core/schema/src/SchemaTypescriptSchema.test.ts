import { expect, it } from "vitest";
import SchemaTypescriptSchema from "./SchemaTypescriptSchema.js";

it("exports the Schema type definition", () => {
  expect(SchemaTypescriptSchema).toMatchInlineSnapshot(`
    "enum DataType {
      String = "String",

      /** A set of known strings. */
      Enum = "Enum",

      Number = "Number",

      Boolean = "Boolean",

      /** One specific String. */
      StringLiteral = "StringLiteral",

      /** One specific Number. */
      NumberLiteral = "NumberLiteral",

      /** One specific Boolean. */
      BooleanLiteral = "BooleanLiteral",

      /** A JsonObject. */
      JsonObject = "JsonObject",

      /** A FileRef or a ProtoFile, depending on the context. */
      File = "File",

      /** Object containing only known properties. */
      Struct = "Struct",

      /** List of items of another type. */
      List = "List",
    }

    interface Described {
      description?: string | undefined;
    }

    interface StringTypeDefinition extends Described {
      dataType: DataType.String;
      /** Id of the format the string value must abide by. */
      format?: string | undefined;
    }

    interface EnumMember extends Described {
      value: string;
    }
    interface EnumTypeDefinition extends Described {
      dataType: DataType.Enum;
      members: {
        [member: string]: EnumMember;
      };
    }

    interface NumberTypeDefinition extends Described {
      dataType: DataType.Number;
      /** Id of the format the number value must abide by. */
      format?: string | undefined;
    }

    interface BooleanTypeDefinition extends Described {
      dataType: DataType.Boolean;
    }

    interface StringLiteralTypeDefinition extends Described {
      dataType: DataType.StringLiteral;
      value: string;
    }

    interface NumberLiteralTypeDefinition extends Described {
      dataType: DataType.NumberLiteral;
      value: number;
    }

    interface BooleanLiteralTypeDefinition extends Described {
      dataType: DataType.BooleanLiteral;
      value: boolean;
    }

    interface JsonObjectTypeDefinition extends Described {
      dataType: DataType.JsonObject;
      /** Id of the format the JsonObject value must abide by. */
      format?: string | undefined;
    }

    type AcceptedFileExtensions = "*" | string[];
    interface FileTypeDefinition extends Described {
      dataType: DataType.File;
      /**
       * Object specifying which mime types, and for each mime type which
       * extensions, are accepted.
       *
       * The object's keys are _mime type matchers_: glob-like strings matching one
       * or more mime types. Examples:
       *
       * - \`image/png\` matches only the mime type \`image/png\`.
       * - \`image/*\` matches all mime types like \`image/png\`, \`image/jpg\`, etc.
       *
       * The object values are _accepted file extensions_, which are either:
       *
       * - The \`*\` string, which accepts all extensions.
       * - An array of extensions, which accepts only the exact extensions listed.
       *
       * @example
       * {
       *   "image/*": [".png", ".jpg"],
       *   "text/plain": "*"
       * }
       */
      accept?: { [mimeTypeMatcher: string]: AcceptedFileExtensions } | undefined;
    }

    interface StructTypeDefinition extends Described {
      dataType: DataType.Struct;
      properties: {
        [name: string]: AnyTypeDefinition;
      };
      /** A Struct's properties are all non-nullable by default. */
      nullableProperties?: string[] | undefined;
    }

    interface ListTypeDefinition extends Described {
      dataType: DataType.List;
      items: AnyTypeDefinition;
    }

    interface TypeDefinitionRef extends Described {
      dataType: null;
      ref: string;
    }

    type AnyTypeDefinition =
      | StringTypeDefinition
      | NumberTypeDefinition
      | EnumTypeDefinition
      | BooleanTypeDefinition
      | StringLiteralTypeDefinition
      | NumberLiteralTypeDefinition
      | BooleanLiteralTypeDefinition
      | JsonObjectTypeDefinition
      | FileTypeDefinition
      | StructTypeDefinition
      | ListTypeDefinition
      | TypeDefinitionRef;

    interface Schema {
      /**
       * Record (by name) of type definitions. Define complex types here once and
       * reuse them elsewhere in the schema.
       */
      types: {
        [name: string]: AnyTypeDefinition;
      };
      /**
       * Ref to the type that defines the overall structure of the document. Must
       * exist in \`types\`. Must be a \`StructTypeDefinition\`.
       */
      rootType: string;
    }
    "
  `);
});
