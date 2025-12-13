import * as v from "valibot";
import DataType from "../../DataType.js";
import formats from "../../formats/formats.js";
import type Schema from "../../Schema.js";
import type { AnyTypeDefinition } from "../../typeDefinitions.js";
import findFormat from "../../utils/findFormat.js";
import getRootType from "../../utils/getRootType.js";
import file from "../file/file.js";
import jsonObject from "../jsonObject/jsonObject.js";

export default function content(
  schema: Schema,
  /**
   * The content valibot schema is used both for validating a document content
   * object in the executing backend, but also for validating the document
   * content form in the browser app.
   *
   * That app uses react-hook-form (shortened, RHF) to build the form. RHF does
   * not support "flat" array fields, i.e. array fields where the items in the
   * array are non-objects. Hence the "rhf" variant of the valibot schema, which
   * validates document content objects used by RHF where list items have been
   * wrapped in an object with shape `{ value: Item }`.
   */
  variant: "normal" | "rhf" = "normal",
): v.GenericSchema<any, any> {
  return memoizedToValibotSchema(getRootType(schema), schema.types, variant);
}

const valibotSchemaCache = new WeakMap();
function memoizedToValibotSchema(
  typeDefinition: AnyTypeDefinition,
  types: Schema["types"],
  variant: "normal" | "rhf",
): v.GenericSchema {
  const cachedValibotSchema = valibotSchemaCache.get(typeDefinition);
  if (cachedValibotSchema) {
    return cachedValibotSchema;
  }
  const valibotSchema = toValibotSchema(typeDefinition, types, variant);
  valibotSchemaCache.set(typeDefinition, valibotSchema);
  return valibotSchema;
}

function toValibotSchema(
  typeDefinition: AnyTypeDefinition,
  types: Schema["types"],
  variant: "normal" | "rhf",
): v.GenericSchema {
  if ("ref" in typeDefinition) {
    // Lazy is needed to avoid infinite loops for schemas that reference
    // themselves.
    return v.lazy(() =>
      memoizedToValibotSchema(types[typeDefinition.ref]!, types, variant),
    );
  }
  switch (typeDefinition.dataType) {
    case DataType.String:
      return findFormat(typeDefinition, formats)?.valibotSchema ?? v.string();
    case DataType.Enum:
      return v.picklist(
        Object.values(typeDefinition.members).map(({ value }) => value),
      );
    case DataType.Number:
      return findFormat(typeDefinition, formats)?.valibotSchema ?? v.number();
    case DataType.Boolean:
      return v.boolean();
    case DataType.StringLiteral:
    case DataType.NumberLiteral:
    case DataType.BooleanLiteral:
      return v.literal(typeDefinition.value);
    case DataType.JsonObject:
      return findFormat(typeDefinition, formats)?.valibotSchema ?? jsonObject();
    case DataType.File:
      return file(typeDefinition.accept, variant);
    case DataType.Struct:
      return v.strictObject(
        Object.fromEntries(
          Object.entries(typeDefinition.properties).map(
            ([propertyName, propertyTypeDefinition]) => {
              const PropertyValibotSchema = memoizedToValibotSchema(
                propertyTypeDefinition,
                types,
                variant,
              );
              return [
                propertyName,
                typeDefinition.nullableProperties?.includes(propertyName)
                  ? v.nullable(PropertyValibotSchema)
                  : PropertyValibotSchema,
              ];
            },
          ),
        ),
      );
    case DataType.List: {
      const item = memoizedToValibotSchema(
        typeDefinition.items,
        types,
        variant,
      );
      return v.array(
        variant === "normal" ? item : v.strictObject({ value: item }),
      );
    }
  }
}
