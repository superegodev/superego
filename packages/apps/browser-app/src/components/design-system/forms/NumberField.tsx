import type { RefAttributes } from "react";
import {
  type NumberFieldProps,
  NumberField as NumberFieldRAC,
} from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./forms.css.js";

interface Props extends NumberFieldProps {
  className?: string | undefined;
}
export default function NumberField({
  className,
  ...props
}: Props & RefAttributes<HTMLDivElement>) {
  return (
    <NumberFieldRAC
      {...props}
      className={classnames(cs.NumberField.root, className)}
    />
  );
}
