import type DataType from "./DataType.js";

export interface Described {
  description?: string | undefined;
}

export interface StringTypeDefinition extends Described {
  dataType: DataType.String;
  /** Id of the format the string value must abide by. */
  format?: string | undefined;
}

export interface EnumMember extends Described {
  value: string;
}
export interface EnumTypeDefinition extends Described {
  dataType: DataType.Enum;
  members: {
    [member: string]: EnumMember;
  };
}

export interface NumberTypeDefinition extends Described {
  dataType: DataType.Number;
  /** Id of the format the number value must abide by. */
  format?: string | undefined;
}

export interface BooleanTypeDefinition extends Described {
  dataType: DataType.Boolean;
}

export interface StringLiteralTypeDefinition extends Described {
  dataType: DataType.StringLiteral;
  value: string;
}

export interface NumberLiteralTypeDefinition extends Described {
  dataType: DataType.NumberLiteral;
  value: number;
}

export interface BooleanLiteralTypeDefinition extends Described {
  dataType: DataType.BooleanLiteral;
  value: boolean;
}

export interface JsonObjectTypeDefinition extends Described {
  dataType: DataType.JsonObject;
  /** Id of the format the JsonObject value must abide by. */
  format?: string | undefined;
}

export type AcceptedFileExtensions = "*" | string[];
export interface FileTypeDefinition extends Described {
  dataType: DataType.File;
  /**
   * Object specifying which mime types, and for each mime type which
   * extensions, are accepted.
   *
   * The object's keys are _mime type matchers_: glob-like strings matching one
   * or more mime types. Examples:
   *
   * - `image/png` matches only the mime type `image/png`.
   * - `image/*` matches all mime types like `image/png`, `image/jpg`, etc.
   *
   * The object values are _accepted file extensions_, which are either:
   *
   * - The `*` string, which accepts all extensions.
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

export interface StructTypeDefinition extends Described {
  dataType: DataType.Struct;
  properties: {
    [name: string]: Exclude<AnyTypeDefinition, EnumTypeDefinition>;
  };
  /** A Struct's properties are all non-nullable by default. */
  nullableProperties?: string[] | undefined;
}

export interface ListTypeDefinition extends Described {
  dataType: DataType.List;
  items: Exclude<AnyTypeDefinition, EnumTypeDefinition>;
}

export interface TypeDefinitionRef extends Described {
  dataType: null;
  ref: string;
}

export type AnyTypeDefinition =
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
