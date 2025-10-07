/// <reference types="vite/client" />
import {
  isValidInstant,
  isValidPlainDate,
  isValidPlainTime,
} from "./utils/dateTimeValidators.js";
import getRootType from "./utils/getRootType.js";
import getType from "./utils/getType.js";
import getTypeDefinitionAtPath from "./utils/getTypeDefinitionAtPath.js";
import parsePath from "./utils/parsePath.js";
import content from "./valibot-schemas/content/content.js";
import schema from "./valibot-schemas/schema/schema.js";

export { default as codegen } from "./codegen/codegen.js";
export { default as DataType } from "./DataType.js";
export type { default as Format } from "./Format.js";
export { default as FormatId } from "./formats/FormatId.js";
export { default as formats } from "./formats/formats.js";
export type { default as Schema } from "./Schema.js";
export { default as SchemaJsonSchema } from "./SchemaJsonSchema.js";
export type { default as TypeOf } from "./TypeOf.js";
export type * from "./typeDefinitions.js";
export type { default as FileRef } from "./types/FileRef.js";
export type { default as JsonObject } from "./types/JsonObject.js";
export type { default as ProtoFile } from "./types/ProtoFile.js";
export const valibotSchemas = { schema, content };
export const utils = {
  getRootType,
  getType,
  getTypeDefinitionAtPath,
  parsePath,
  isValidInstant,
  isValidPlainDate,
  isValidPlainTime,
};
