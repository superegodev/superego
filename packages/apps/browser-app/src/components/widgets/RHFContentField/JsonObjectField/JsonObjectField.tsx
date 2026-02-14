import { FormatId } from "@superego/schema";
import Default from "./formats/Default.js";
import ExcalidrawDrawing from "./formats/ExcalidrawDrawing.js";
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
  const Component = getComponent(typeDefinition);
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

function getComponent(typeDefinition: Props["typeDefinition"]) {
  switch ("format" in typeDefinition && typeDefinition.format) {
    case FormatId.JsonObject.ExcalidrawDrawing:
      return ExcalidrawDrawing;
    case FormatId.JsonObject.GeoJSON:
      return GeoJSON;
    case FormatId.JsonObject.TiptapRichText:
      return TiptapRichText;
    default:
      return Default;
  }
}
