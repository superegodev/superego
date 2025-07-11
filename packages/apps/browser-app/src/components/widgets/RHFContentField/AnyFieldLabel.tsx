import { type AnyTypeDefinition, DataType } from "@superego/schema";
import type { ReactNode } from "react";
import last from "../../../utils/last.js";
import FieldLabel from "../../design-system/FieldLabel/FieldLabel.js";
import * as cs from "./RHFContentField.css.js";

interface Props {
  typeDefinition: AnyTypeDefinition;
  label: string;
  actions?: ReactNode | undefined;
  component?: "label" | "legend" | undefined;
  className?: string | undefined;
}
export default function AnyFieldLabel({
  typeDefinition,
  label,
  actions,
  component = "label",
  className,
}: Props) {
  const dataTypeLabel =
    typeDefinition.dataType === null
      ? typeDefinition.ref
      : typeDefinition.dataType === DataType.List
        ? typeDefinition.items.dataType === null
          ? `List<${typeDefinition.items.ref}>`
          : `List<${typeDefinition.items.dataType}>`
        : "format" in typeDefinition && typeDefinition.format
          ? `${last(typeDefinition.format.split("."))} (${typeDefinition.dataType})`
          : typeDefinition.dataType;
  return (
    <FieldLabel actions={actions} component={component} className={className}>
      {label}
      <span className={cs.AnyFieldLabel.dataType}>{dataTypeLabel}</span>
    </FieldLabel>
  );
}
