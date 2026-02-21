import { parseDate } from "@internationalized/date";
import type { ReactNode } from "react";
import { DateRangePicker as DateRangePickerRAC } from "react-aria-components";
import DateRangePickerCalendar from "./DateRangePickerCalendar.js";
import DateRangePickerInput from "./DateRangePickerInput.js";
import Description from "./Description.js";
import * as cs from "./forms.css.js";
import Label from "./Label.js";

interface DateRange {
  /** ISO 8601 */
  start: string;
  /** ISO 8601 */
  end: string;
}

interface Props {
  value: DateRange | null;
  onChange: (newValue: DateRange | null) => void;
  layout?: "vertical" | "horizontal" | undefined;
  label?: ReactNode | undefined;
  ariaLabel?: string | undefined;
  description?: ReactNode | undefined;
  isDisabled?: boolean | undefined;
}
export default function PlainDateRangePicker({
  value,
  onChange,
  layout = "vertical",
  label,
  ariaLabel,
  description,
  isDisabled,
}: Props) {
  return (
    <DateRangePickerRAC
      value={value !== null ? safeParseDateRange(value.start, value.end) : null}
      onChange={(value) => {
        if (value && value.start && value.end) {
          onChange({
            start: value.start.toString(),
            end: value.end.toString(),
          });
        } else {
          onChange(null);
        }
      }}
      isDisabled={isDisabled}
      aria-label={ariaLabel}
      className={cs.DateRangePicker.root[layout]}
    >
      {label ? <Label>{label}</Label> : null}
      <DateRangePickerInput
        onClear={value !== null ? () => onChange(null) : undefined}
      />
      <DateRangePickerCalendar />
      {description ? <Description>{description}</Description> : null}
    </DateRangePickerRAC>
  );
}

function safeParseDateRange(start: string, end: string) {
  try {
    const parsedStart = parseDate(start);
    const parsedEnd = parseDate(end);
    return { start: parsedStart, end: parsedEnd };
  } catch {
    return null;
  }
}
