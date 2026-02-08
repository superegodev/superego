import { FormatId } from "@superego/schema";
import Default from "./formats/Default.js";
import GeoJSON from "./formats/GeoJSON.js";
import TiptapRichText from "./formats/TiptapRichText.js";
import type Props from "./Props.js";

function getComponent(format: string | undefined) {
  switch (format) {
    case FormatId.JsonObject.TiptapRichText:
      return TiptapRichText;
    case FormatId.JsonObject.GeoJSON:
      return GeoJSON;
    default:
      return Default;
  }
}

export default function JsonObjectField({
  typeDefinition,
  isNullable,
  isListItem,
  control,
  name,
  label,
}: Props) {
  const Component = getComponent(typeDefinition.format);
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
