import { parseDate } from "@internationalized/date";
import type { ReactNode } from "react";
import { DatePicker as DatePickerRAC } from "react-aria-components";
import DatePickerCalendar from "./DatePickerCalendar.js";
import DatePickerInput from "./DatePickerInput.js";
import Description from "./Description.js";
import * as cs from "./forms.css.js";
import Label from "./Label.js";

interface Props {
  /** ISO8601 */
  value: string | null;
  onChange: (newValue: string | null) => void;
  label?: ReactNode | undefined;
  description?: ReactNode | undefined;
  isDisabled?: boolean | undefined;
}
export default function PlainDatePicker({
  value,
  onChange,
  label,
  description,
  isDisabled,
}: Props) {
  return (
    <DatePickerRAC
      value={value !== null ? safeParseDate(value) : null}
      onChange={(value) => onChange(value?.toString() ?? null)}
      isDisabled={isDisabled}
      className={cs.DatePicker.root}
    >
      {label ? <Label>{label}</Label> : null}
      <DatePickerInput />
      <DatePickerCalendar />
      {description ? <Description>{description}</Description> : null}
    </DatePickerRAC>
  );
}

function safeParseDate(value: string) {
  try {
    return parseDate(value);
  } catch {
    return null;
  }
}
