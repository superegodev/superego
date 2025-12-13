import type { ReactNode } from "react";
import { Input, NumberField as NumberFieldRAC } from "react-aria-components";
import Description from "./Description.js";
import * as cs from "./forms.css.js";
import Label from "./Label.js";

interface Props {
  value: number | null;
  onChange: (newValue: number | null) => void;
  label?: ReactNode | undefined;
  ariaLabel?: string | undefined;
  description?: ReactNode | undefined;
  placeholder?: string | undefined;
  isDisabled?: boolean | undefined;
  minValue?: number | undefined;
  maxValue?: number | undefined;
  step?: number | undefined;
}
export default function NumberField({
  value,
  onChange,
  label,
  ariaLabel,
  description,
  placeholder,
  isDisabled,
  minValue,
  maxValue,
  step,
}: Props) {
  return (
    <NumberFieldRAC
      value={value ?? Number.NaN}
      onChange={onChange}
      isDisabled={isDisabled}
      aria-label={ariaLabel}
      minValue={minValue}
      maxValue={maxValue}
      step={step}
      className={cs.NumberField.root}
    >
      {label ? <Label>{label}</Label> : null}
      <Input
        className={cs.Input.root}
        inputMode="decimal"
        placeholder={placeholder}
      />
      {description ? <Description>{description}</Description> : null}
    </NumberFieldRAC>
  );
}
