import type { ReactNode } from "react";
import { Select as SelectRAC } from "react-aria-components";
import Description from "./Description.js";
import * as cs from "./forms.css.js";
import Label from "./Label.js";
import SelectButton from "./SelectButton.js";
import type SelectOption from "./SelectOption.js";
import SelectOptions from "./SelectOptions.js";

interface Props {
  mode?: "single" | "multiple" | undefined;
  value: string | null | string[];
  onChange: (newValue: string | null | string[]) => void;
  options: SelectOption[];
  layout?: "vertical" | "horizontal" | undefined;
  isDisabled?: boolean | undefined;
  label?: ReactNode | undefined;
  ariaLabel?: string | undefined;
  description?: ReactNode | undefined;
}
export default function Select({
  mode = "single",
  value,
  onChange,
  options,
  layout = "vertical",
  isDisabled,
  label,
  ariaLabel,
  description,
}: Props) {
  return (
    <SelectRAC
      selectionMode={mode}
      value={value as any}
      onChange={(newValue) => onChange(newValue as any)}
      isDisabled={isDisabled}
      aria-label={ariaLabel}
      className={cs.Select.root[layout]}
    >
      {label ? <Label>{label}</Label> : null}
      <SelectButton
        onClear={typeof value === "string" ? () => onChange(null) : undefined}
      />
      <SelectOptions options={options} />
      {description ? <Description>{description}</Description> : null}
    </SelectRAC>
  );
}
