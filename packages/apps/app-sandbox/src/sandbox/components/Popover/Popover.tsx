import clsx from "clsx";
import {
  type PopoverProps,
  Popover as PopoverRAC,
} from "react-aria-components";
import * as cs from "./Popover.css.js";

export default function Popover({ className, ...rest }: PopoverProps) {
  return <PopoverRAC className={clsx(cs.Popover.root, className)} {...rest} />;
}
