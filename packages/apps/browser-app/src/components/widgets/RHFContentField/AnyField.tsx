import {
  type AnyTypeDefinition,
  DataType,
  type Schema,
  utils,
} from "@superego/schema";
import type { Control } from "react-hook-form";
import BooleanField from "./BooleanField.js";
import EnumField from "./EnumField.js";
import FileField from "./FileField.js";
import JsonObjectField from "./JsonObjectField/JsonObjectField.js";
import ListField from "./ListField.js";
import NumberField from "./NumberField.js";
import StringField from "./StringField/StringField.js";
import StructField from "./StructField.js";

interface Props {
  schema: Schema;
  typeDefinition: AnyTypeDefinition;
  isNullable: boolean;
  isListItem: boolean;
  control: Control;
  name: string;
  label: string;
}
export default function AnyField({
  schema,
  typeDefinition,
  isNullable,
  isListItem = false,
  control,
  name,
  label,
}: Props) {
  switch (typeDefinition.dataType) {
    case DataType.String:
    case DataType.StringLiteral:
      return (
        <StringField
          typeDefinition={typeDefinition}
          isNullable={isNullable}
          isListItem={isListItem}
          control={control}
          name={name}
          label={label}
        />
      );
    case DataType.Enum:
      return (
        <EnumField
          typeDefinition={typeDefinition}
          isNullable={isNullable}
          isListItem={isListItem}
          control={control}
          name={name}
          label={label}
        />
      );
    case DataType.Number:
    case DataType.NumberLiteral:
      return (
        <NumberField
          typeDefinition={typeDefinition}
          isNullable={isNullable}
          isListItem={isListItem}
          control={control}
          name={name}
          label={label}
        />
      );
    case DataType.Boolean:
    case DataType.BooleanLiteral:
      return (
        <BooleanField
          typeDefinition={typeDefinition}
          isNullable={isNullable}
          isListItem={isListItem}
          control={control}
          name={name}
          label={label}
        />
      );
    case DataType.JsonObject:
      return (
        <JsonObjectField
          typeDefinition={typeDefinition}
          isNullable={isNullable}
          isListItem={isListItem}
          control={control}
          name={name}
          label={label}
        />
      );
    case DataType.File:
      return (
        <FileField
          typeDefinition={typeDefinition}
          isNullable={isNullable}
          isListItem={isListItem}
          control={control}
          name={name}
          label={label}
        />
      );
    case DataType.Struct:
      return (
        <StructField
          schema={schema}
          typeDefinition={typeDefinition}
          isNullable={isNullable}
          isListItem={isListItem}
          control={control}
          name={name}
          label={label}
        />
      );
    case DataType.List:
      return (
        <ListField
          schema={schema}
          typeDefinition={typeDefinition}
          isNullable={isNullable}
          isListItem={isListItem}
          control={control}
          name={name}
          label={label}
        />
      );
    case DataType.DocumentRef:
      // TODO: DocumentRefField
      return null;
    case null:
      return (
        <AnyField
          schema={schema}
          typeDefinition={utils.getType(schema, typeDefinition)}
          isNullable={isNullable}
          isListItem={isListItem}
          control={control}
          name={name}
          label={label}
        />
      );
  }
}
