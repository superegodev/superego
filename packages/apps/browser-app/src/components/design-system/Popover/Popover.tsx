import type { RefAttributes } from "react";
import {
  type PopoverProps,
  Popover as PopoverRAC,
} from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./Popover.css.js";

interface Props extends PopoverProps {
  className?: string | undefined;
}
export default function Popover({
  className,
  ...props
}: Props & RefAttributes<HTMLElement>) {
  return (
    <PopoverRAC {...props} className={classnames(cs.Popover.root, className)} />
  );
}
