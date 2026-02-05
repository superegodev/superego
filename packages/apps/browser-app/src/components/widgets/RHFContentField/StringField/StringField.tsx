import { FormatId } from "@superego/schema";
import Default from "./formats/Default.js";
import Instant from "./formats/Instant.js";
import Markdown from "./formats/Markdown.js";
import PlainDate from "./formats/PlainDate.js";
import PlainTime from "./formats/PlainTime.js";
import type Props from "./Props.js";

export default function StringField({
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
      isNullable={isNullable}
      isListItem={isListItem}
      control={control}
      name={name}
      label={label}
    />
  );
}

function getComponent(typeDefinition: Props["typeDefinition"]) {
  switch ("format" in typeDefinition && typeDefinition.format) {
    case FormatId.String.PlainDate:
      return PlainDate;
    case FormatId.String.PlainTime:
      return PlainTime;
    case FormatId.String.Instant:
      return Instant;
    case FormatId.String.Markdown:
      return Markdown;
    default:
      return Default;
  }
}
