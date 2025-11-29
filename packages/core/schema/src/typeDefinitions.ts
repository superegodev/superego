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
  /**
   * Member names **must** match the regex `/^[a-zA-Z_$][a-zA-Z0-9_$]{0,127}$/`.
   */
  members: {
    [name: string]: EnumMember;
  };
  /**
   * Preferred order for displaying members in UIs. If specified:
   * - **Must** contain ALL members defined in {@link members}, and
   *   nothing else.
   * - **Must** not contain duplicates.
   */
  membersOrder?: string[] | undefined;
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

/**
 * Defines a JavaScript object value matching these requirements:
 * - Must be a plain JavaScript object. No functions, symbols, Dates, Maps,
 *   Sets, etc.
 * - Must include the top-level branding property:
 *   `{ __dataType: "JsonObject", ... }`.
 */
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
   * - `*\/*` matches all mime types.
   * - `image/png` matches only the mime type `image/png`.
   * - `image/*` matches all mime types like `image/png`, `image/jpg`, etc.
   *
   * The object values are _accepted file extensions_, which are either:
   *
   * - The `*` string (NOT wrapped in an array), which accepts all extensions.
   * - An array of extensions, which accepts only the exact extensions listed.
   *
   * @example
   * {
   *   "text/plain": "*",
   *   "image/*": [".png", ".jpg"]
   * }
   */
  accept?: { [mimeTypeMatcher: string]: AcceptedFileExtensions } | undefined;
}

/**
 * Defines a structured object with a fixed set of named properties.
 *
 * @remarks
 * - **All properties are required.** Every key defined in {@link properties}
 *   must be present in a value conforming to this type. Optional (missing)
 *   properties are not allowed.
 * - **`undefined` is never allowed** as a property value. Use `null` to
 *   represent “no value”.
 * - **Nullability is opt-in per property.** A property may be `null` only if
 *   its name appears in {@link nullableProperties}. All other properties must
 *   be non-null.
 * - {@link propertiesOrder} controls **display order** in UIs and does not
 *   affect validation.
 */
export interface StructTypeDefinition extends Described {
  dataType: DataType.Struct;
  /**
   * The complete set of properties that make up this Struct. Property names
   * **must** match the regex `/^[a-zA-Z_$][a-zA-Z0-9_$]{0,127}$/`.
   */
  properties: {
    [name: string]: AnyTypeDefinition;
  };
  /**
   * Names of properties that are allowed to be `null`.
   *
   * @remarks
   * - Each entry **must** be a key present in {@link properties}.
   * - **Must** not contain duplicates.
   * - Defaults to none (i.e., all properties are non-nullable).
   */
  nullableProperties?: string[] | undefined;
  /**
   * Preferred order for displaying properties in UIs. If specified:
   * - **Must** contain ALL properties defined in {@link properties}, and
   *   nothing else.
   * - **Must** not contain duplicates.
   */
  propertiesOrder?: string[] | undefined;
}

export interface ListTypeDefinition extends Described {
  dataType: DataType.List;
  items: AnyTypeDefinition;
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
