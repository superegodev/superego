import { type AnyTypeDefinition, DataType } from "@superego/schema";
import type { ReactNode } from "react";
import { Button, TooltipTrigger } from "react-aria-components";
import { FormattedMessage } from "react-intl";
import last from "../../../utils/last.js";
import FieldLabel from "../../design-system/FieldLabel/FieldLabel.js";
import Tooltip from "../../design-system/Tooltip/Tooltip.js";
import * as cs from "./RHFContentField.css.js";
import { useUiOptions } from "./uiOptions.js";

interface Props {
  typeDefinition: AnyTypeDefinition;
  isNullable: boolean;
  label: string;
  actions?: ReactNode | undefined;
  component?: "label" | "legend" | undefined;
  className?: string | undefined;
}
export default function AnyFieldLabel({
  typeDefinition,
  isNullable,
  label,
  actions,
  component = "label",
  className,
}: Props) {
  const { showTypes, showNullability } = useUiOptions();
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
      {showTypes ? (
        <span className={cs.AnyFieldLabel.dataType}>
          {dataTypeLabel}
          {showNullability ? (
            isNullable ? (
              " (Nullable)"
            ) : (
              " (Non-nullable)"
            )
          ) : !isNullable ? (
            <TooltipTrigger delay={500}>
              <Button slot={null} className={cs.AnyFieldLabel.tooltipTrigger}>
                <sup className={cs.AnyFieldLabel.nonNullableAsterisk}>
                  {"*"}
                </sup>
              </Button>
              <Tooltip>
                <FormattedMessage defaultMessage="Required" />
              </Tooltip>
            </TooltipTrigger>
          ) : null}
        </span>
      ) : null}
      {typeDefinition.description ? (
        <TooltipTrigger delay={500}>
          <Button slot={null} className={cs.AnyFieldLabel.tooltipTrigger}>
            <sup>{"ℹ"}</sup>
          </Button>
          <Tooltip>{typeDefinition.description}</Tooltip>
        </TooltipTrigger>
      ) : null}
    </FieldLabel>
  );
}
