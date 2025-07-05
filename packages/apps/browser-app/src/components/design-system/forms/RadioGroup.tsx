import type { ReactNode, RefAttributes } from "react";
import {
  type RadioGroupProps,
  RadioGroup as RadioGroupRAC,
} from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./forms.css.js";

interface Props extends RadioGroupProps {
  className?: string | undefined;
  children: ReactNode;
}
export default function RadioGroup({
  className,
  ...props
}: Props & RefAttributes<HTMLDivElement>) {
  return (
    <RadioGroupRAC
      {...props}
      className={classnames(cs.RadioGroup.root, className)}
    />
  );
}
