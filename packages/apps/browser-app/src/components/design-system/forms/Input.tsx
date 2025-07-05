import type { RefAttributes } from "react";
import { type InputProps, Input as InputRAC } from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./forms.css.js";

interface Props extends InputProps {
  className?: string | undefined;
}
export default function Input({
  className,
  ...props
}: Props & RefAttributes<HTMLInputElement>) {
  return (
    <InputRAC {...props} className={classnames(cs.Input.root, className)} />
  );
}
