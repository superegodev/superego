/// <reference types="vite/client" />
import {
  isValidInstant,
  isValidPlainDate,
  isValidPlainTime,
} from "./utils/dateTimeValidators.js";
import extractReferencedCollectionIds from "./utils/extractReferencedCollectionIds.js";
import extractTextChunks from "./utils/extractTextChunks.js";
import getRootType from "./utils/getRootType.js";
import getType from "./utils/getType.js";
import getTypeDefinitionAtPath from "./utils/getTypeDefinitionAtPath.js";
import parsePath from "./utils/parsePath.js";
import replaceSelfCollectionId from "./utils/replaceSelfCollectionId.js";
import {
  extractSuggestedCollectionIds,
  isSuggestedCollectionId,
  makeSuggestedCollectionId,
  makeSuggestedCollectionIdMapping,
  parseSuggestedCollectionIndex,
  replaceSuggestedCollectionIds,
} from "./utils/suggestedCollectionIds.js";
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
export type { default as DocumentRef } from "./types/DocumentRef.js";
export type { default as FileRef } from "./types/FileRef.js";
export type { default as JsonObject } from "./types/JsonObject.js";
export type { default as ProtoFile } from "./types/ProtoFile.js";
export type { TextChunks } from "./utils/extractTextChunks.js";
export const valibotSchemas = { schema, content };
export const utils = {
  getRootType,
  getType,
  getTypeDefinitionAtPath,
  parsePath,
  isValidInstant,
  isValidPlainDate,
  isValidPlainTime,
  extractReferencedCollectionIds,
  extractTextChunks,
  replaceSelfCollectionId,
  makeSuggestedCollectionId,
  makeSuggestedCollectionIdMapping,
  isSuggestedCollectionId,
  parseSuggestedCollectionIndex,
  extractSuggestedCollectionIds,
  replaceSuggestedCollectionIds,
};
