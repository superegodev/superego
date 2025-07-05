import { FormatId } from "@superego/schema";
import Default from "./formats/Default.jsx";
import TiptapRichText from "./formats/TiptapRichText.jsx";
import type Props from "./Props.js";

export default function JsonObjectField({
  typeDefinition,
  isListItem,
  control,
  name,
  label,
}: Props) {
  const { format } = typeDefinition;
  const Component =
    format === FormatId.JsonObject.TiptapRichText ? TiptapRichText : Default;
  return (
    <Component
      typeDefinition={typeDefinition}
      isListItem={isListItem}
      control={control}
      name={name}
      label={label}
    />
  );
}
