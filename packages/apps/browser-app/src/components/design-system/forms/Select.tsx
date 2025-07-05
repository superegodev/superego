import type { RefAttributes } from "react";
import { type SelectProps, Select as SelectRAC } from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./forms.css.js";

interface Props extends SelectProps {
  className?: string | undefined;
}
export default function Select({
  className,
  ...props
}: Props & RefAttributes<HTMLDivElement>) {
  return (
    <SelectRAC {...props} className={classnames(cs.Select.root, className)} />
  );
}
