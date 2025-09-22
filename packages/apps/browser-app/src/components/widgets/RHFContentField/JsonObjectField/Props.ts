import type { JsonObjectTypeDefinition } from "@superego/schema";
import type { Control } from "react-hook-form";

export default interface Props {
  typeDefinition: JsonObjectTypeDefinition;
  isNullable: boolean;
  isListItem: boolean;
  control: Control;
  name: string;
  label: string;
}
