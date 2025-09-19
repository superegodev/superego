import * as v from "valibot";
import DataType from "../../DataType.js";
import type Schema from "../../Schema.js";
import type { AnyTypeDefinition } from "../../typeDefinitions.js";
import acceptedFileExtensions from "../acceptedFileExtensions/acceptedFileExtensions.js";
import described from "../described/described.js";
import enumMembers from "../enumMembers/enumMembers.js";
import identifier from "../identifier/identifier.js";
import mimeTypeMatcher from "../mimeTypeMatcher/mimeTypeMatcher.js";
import allReferencedTypesExist from "./checks/allReferencedTypesExist.js";
import noTopLevelTypeDefinitionRefs from "./checks/noTopLevelTypeDefinitionRefs.js";
import noUnusedTypes from "./checks/noUnusedTypes.js";
import nullablePropertiesIsValid from "./checks/nullablePropertiesIsValid.js";
import propertiesOrderIsValid from "./checks/propertiesOrderIsValid.js";
import rootTypeIsStruct from "./checks/rootTypeIsStruct.js";

const StringTypeDefinitionValibotSchema = v.strictObject({
  ...described().entries,
  dataType: v.literal(DataType.String),
  format: v.optional(v.string()),
});

const EnumTypeDefinitionValibotSchema = v.strictObject({
  ...described().entries,
  dataType: v.literal(DataType.Enum),
  members: enumMembers(),
});

const NumberTypeDefinitionValibotSchema = v.strictObject({
  ...described().entries,
  dataType: v.literal(DataType.Number),
  format: v.optional(v.string()),
});

const BooleanTypeDefinitionValibotSchema = v.strictObject({
  ...described().entries,
  dataType: v.literal(DataType.Boolean),
});

const StringLiteralTypeDefinitionValibotSchema = v.strictObject({
  ...described().entries,
  dataType: v.literal(DataType.StringLiteral),
  value: v.string(),
});

const NumberLiteralTypeDefinitionValibotSchema = v.strictObject({
  ...described().entries,
  dataType: v.literal(DataType.NumberLiteral),
  value: v.number(),
});

const BooleanLiteralTypeDefinitionValibotSchema = v.strictObject({
  ...described().entries,
  dataType: v.literal(DataType.BooleanLiteral),
  value: v.boolean(),
});

const JsonObjectTypeDefinitionValibotSchema = v.strictObject({
  ...described().entries,
  dataType: v.literal(DataType.JsonObject),
  format: v.optional(v.string()),
});

const FileTypeDefinitionValibotSchema = v.strictObject({
  ...described().entries,
  dataType: v.literal(DataType.File),
  accept: v.optional(v.record(mimeTypeMatcher(), acceptedFileExtensions())),
});

const StructTypeDefinitionValibotSchema = v.pipe(
  v.strictObject({
    ...described().entries,
    dataType: v.literal(DataType.Struct),
    properties: v.record(
      identifier(),
      v.lazy(() => AnyTypeDefinitionValibotSchema),
    ),
    nullableProperties: v.optional(v.array(v.pipe(v.string()))),
    propertiesOrder: v.optional(v.array(v.pipe(v.string()))),
  }),
  nullablePropertiesIsValid,
  propertiesOrderIsValid,
);

const ListTypeDefinitionValibotSchema = v.strictObject({
  ...described().entries,
  dataType: v.literal(DataType.List),
  items: v.lazy(() => AnyTypeDefinitionValibotSchema),
});

const TypeDefinitionRefValibotSchema = v.strictObject({
  ...described().entries,
  dataType: v.null(),
  ref: v.string(),
});

const AnyTypeDefinitionValibotSchema: v.GenericSchema<
  AnyTypeDefinition,
  AnyTypeDefinition
> = v.variant("dataType", [
  StringTypeDefinitionValibotSchema,
  EnumTypeDefinitionValibotSchema,
  NumberTypeDefinitionValibotSchema,
  BooleanTypeDefinitionValibotSchema,
  StringLiteralTypeDefinitionValibotSchema,
  NumberLiteralTypeDefinitionValibotSchema,
  BooleanLiteralTypeDefinitionValibotSchema,
  JsonObjectTypeDefinitionValibotSchema,
  FileTypeDefinitionValibotSchema,
  StructTypeDefinitionValibotSchema,
  ListTypeDefinitionValibotSchema,
  TypeDefinitionRefValibotSchema,
]);

export default function schema(): v.GenericSchema<Schema, Schema> {
  return v.pipe(
    v.strictObject({
      types: v.record(identifier(), AnyTypeDefinitionValibotSchema),
      rootType: v.string(),
    }),
    rootTypeIsStruct,
    noTopLevelTypeDefinitionRefs,
    allReferencedTypesExist,
    noUnusedTypes,
  );
}
