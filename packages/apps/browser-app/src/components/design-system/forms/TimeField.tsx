import type { RefAttributes } from "react";
import {
  type TimeFieldProps,
  TimeField as TimeFieldRAC,
  type TimeValue,
} from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./forms.css.js";

interface Props<T extends TimeValue> extends TimeFieldProps<T> {
  className?: string | undefined;
}
export default function TimeField<T extends TimeValue>({
  className,
  children,
  ...props
}: Props<T> & RefAttributes<HTMLDivElement>) {
  return (
    <TimeFieldRAC
      {...props}
      className={classnames(cs.TimeField.root, className)}
    >
      {children}
    </TimeFieldRAC>
  );
}
