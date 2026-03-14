import type { RefAttributes } from "react";
import {
  type SelectionMode as SelectionModeRAC,
  type SelectProps,
  Select as SelectRAC,
} from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./forms.css.js";

interface Props<
  SelectionMode extends Exclude<SelectionModeRAC, "none"> = "single",
> extends SelectProps<object, SelectionMode> {
  className?: string | undefined;
}
export default function Select<
  SelectionMode extends Exclude<SelectionModeRAC, "none"> = "single",
>({
  className,
  ...props
}: Props<SelectionMode> & RefAttributes<HTMLDivElement>) {
  return (
    <SelectRAC {...props} className={classnames(cs.Select.root, className)} />
  );
}
