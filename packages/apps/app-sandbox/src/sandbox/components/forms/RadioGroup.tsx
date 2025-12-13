import type { ReactNode } from "react";
import { Radio, RadioGroup as RadioGroupRAC } from "react-aria-components";
import Description from "./Description.js";
import * as cs from "./forms.css.js";
import Label from "./Label.js";
import type SelectOption from "./SelectOption.js";

interface Props {
  value: string;
  onChange: (newValue: string) => void;
  options: SelectOption[];
  isDisabled?: boolean | undefined;
  label?: ReactNode | undefined;
  ariaLabel?: string | undefined;
  description?: ReactNode | undefined;
}
export default function RadioGroup({
  value,
  onChange,
  options,
  isDisabled,
  label,
  ariaLabel,
  description,
}: Props) {
  return (
    <RadioGroupRAC
      value={value}
      onChange={(newValue) => onChange(newValue)}
      isDisabled={isDisabled}
      aria-label={ariaLabel}
      className={cs.RadioGroup.root}
    >
      {label ? <Label>{label}</Label> : null}
      {options.map(
        ({ value: optionValue, label: optionLabel, description }) => (
          <Radio
            key={optionValue}
            value={optionValue}
            className={cs.Radio.root}
          >
            <span className={cs.Radio.label}>{optionLabel ?? optionValue}</span>
            {description ? (
              <span className={cs.Radio.description}>{description}</span>
            ) : null}
          </Radio>
        ),
      )}
      {description ? <Description>{description}</Description> : null}
    </RadioGroupRAC>
  );
}
