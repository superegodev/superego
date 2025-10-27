import type { ReactNode } from "react";
import { Select as SelectRAC } from "react-aria-components";
import useIntlMessages from "../../business-logic/intl-messages/useIntlMessages.js";
import Description from "./Description.jsx";
import * as cs from "./forms.css.js";
import Label from "./Label.jsx";
import SelectButton from "./SelectButton.jsx";
import type { Option } from "./SelectOptions.js";
import SelectOptions from "./SelectOptions.js";

const nullOptionValue = crypto.randomUUID();

interface Props {
  value: string | null;
  onChange: (newValue: string | null) => void;
  options: Option[];
  isDisabled?: boolean | undefined;
  label?: ReactNode | undefined;
  description?: ReactNode | undefined;
  placeholder?: ReactNode | undefined;
}
export default function Select({
  value,
  onChange,
  options,
  isDisabled,
  label,
  description,
  placeholder,
}: Props) {
  const { nullOptionLabel } = useIntlMessages("Select");
  const valueIsValid =
    value === null || options.some((option) => option.value === value);
  return (
    <SelectRAC
      value={valueIsValid ? value : null}
      onChange={(newValue) =>
        onChange(newValue === nullOptionValue ? null : (newValue as string))
      }
      isDisabled={isDisabled}
      className={cs.Select.root}
    >
      {label ? <Label>{label}</Label> : null}
      <SelectButton placeholder={placeholder} />
      <SelectOptions
        options={[
          {
            value: nullOptionValue,
            label: (
              <span className={cs.Select.nullOptionLabel}>
                {`(${nullOptionLabel})`}
              </span>
            ),
          },
          ...options,
        ]}
      />
      {description ? <Description>{description}</Description> : null}
    </SelectRAC>
  );
}
