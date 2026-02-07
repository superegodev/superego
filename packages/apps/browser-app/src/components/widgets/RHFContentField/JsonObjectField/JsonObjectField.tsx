import { FormatId } from "@superego/schema";
import Default from "./formats/Default.js";
import GeoJSON from "./formats/GeoJSON.js";
import TiptapRichText from "./formats/TiptapRichText.js";
import type Props from "./Props.js";

export default function JsonObjectField({
  typeDefinition,
  isNullable,
  isListItem,
  control,
  name,
  label,
}: Props) {
  const { format } = typeDefinition;
  const Component =
    format === FormatId.JsonObject.TiptapRichText
      ? TiptapRichText
      : format === FormatId.JsonObject.GeoJSON
        ? GeoJSON
        : Default;
  return (
    <Component
      typeDefinition={typeDefinition}
      isListItem={isListItem}
      isNullable={isNullable}
      control={control}
      name={name}
      label={label}
    />
  );
}
