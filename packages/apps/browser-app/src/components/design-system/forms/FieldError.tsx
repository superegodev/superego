import type { RefAttributes } from "react";
import {
  type FieldErrorProps,
  FieldError as FieldErrorRAC,
} from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./forms.css.js";

interface Props extends FieldErrorProps {
  className?: string | undefined;
}
export default function FieldError({
  className,
  ...props
}: Props & RefAttributes<HTMLElement>) {
  return (
    <FieldErrorRAC
      {...props}
      className={classnames(cs.FieldError.root, className)}
    />
  );
}
