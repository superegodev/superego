import type { ReactNode } from "react";
import { Select as SelectRAC } from "react-aria-components";
import Description from "./Description.js";
import * as cs from "./forms.css.js";
import Label from "./Label.js";
import SelectButton from "./SelectButton.js";
import type SelectOption from "./SelectOption.js";
import SelectOptions from "./SelectOptions.js";

interface Props {
  value: string | null;
  onChange: (newValue: string) => void;
  options: SelectOption[];
  isDisabled?: boolean | undefined;
  label?: ReactNode | undefined;
  ariaLabel?: string | undefined;
  description?: ReactNode | undefined;
}
export default function Select({
  value,
  onChange,
  options,
  isDisabled,
  label,
  ariaLabel,
  description,
}: Props) {
  return (
    <SelectRAC
      value={value}
      onChange={(newValue) => onChange(newValue as string)}
      isDisabled={isDisabled}
      aria-label={ariaLabel}
      className={cs.Select.root}
    >
      {label ? <Label>{label}</Label> : null}
      <SelectButton />
      <SelectOptions options={options} />
      {description ? <Description>{description}</Description> : null}
    </SelectRAC>
  );
}
