import type {
  StringLiteralTypeDefinition,
  StringTypeDefinition,
} from "@superego/schema";
import type { Control } from "react-hook-form";

export default interface Props {
  typeDefinition: StringTypeDefinition | StringLiteralTypeDefinition;
  isListItem: boolean;
  control: Control;
  name: string;
  label: string;
}
