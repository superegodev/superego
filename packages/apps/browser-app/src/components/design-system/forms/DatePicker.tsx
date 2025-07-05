import type { RefAttributes } from "react";
import {
  type DatePickerProps,
  DatePicker as DatePickerRAC,
  type DateValue,
} from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./forms.css.js";

interface Props<T extends DateValue> extends DatePickerProps<T> {
  className?: string | undefined;
}
export default function DatePicker<T extends DateValue>({
  className,
  children,
  ...props
}: Props<T> & RefAttributes<HTMLDivElement>) {
  return (
    <DatePickerRAC
      {...props}
      className={classnames(cs.DatePicker.root, className)}
    >
      {children}
    </DatePickerRAC>
  );
}
