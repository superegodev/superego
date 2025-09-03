import { FormatId } from "@superego/schema";
import Default from "./formats/Default.js";
import PlainDate from "./formats/PlainDate.js";
import type Props from "./Props.js";

export default function StringField({
  typeDefinition,
  isListItem,
  control,
  name,
  label,
}: Props) {
  const Component =
    "format" in typeDefinition
      ? typeDefinition.format === FormatId.String.PlainDate
        ? PlainDate
        : Default
      : Default;
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
