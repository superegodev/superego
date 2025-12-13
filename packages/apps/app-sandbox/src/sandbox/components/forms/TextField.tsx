import type { ReactNode } from "react";
import { Input, TextField as TextFieldRAC } from "react-aria-components";
import Description from "./Description.js";
import * as cs from "./forms.css.js";
import Label from "./Label.js";

interface Props {
  value: string | null;
  onChange: (newValue: string | null) => void;
  label?: ReactNode | undefined;
  ariaLabel?: string | undefined;
  description?: ReactNode | undefined;
  placeholder?: string | undefined;
  isDisabled?: boolean | undefined;
}
export default function TextField({
  value,
  onChange,
  label,
  ariaLabel,
  description,
  placeholder,
  isDisabled,
}: Props) {
  return (
    <TextFieldRAC
      value={value ?? ""}
      onChange={(newValue) => onChange(newValue === "" ? null : newValue)}
      isDisabled={isDisabled}
      aria-label={ariaLabel}
      className={cs.TextField.root}
    >
      {label ? <Label>{label}</Label> : null}
      <Input className={cs.Input.root} placeholder={placeholder} />
      {description ? <Description>{description}</Description> : null}
    </TextFieldRAC>
  );
}
