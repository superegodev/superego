import type { ReactNode } from "react";
import { Popover as PopoverRAC } from "react-aria-components";
import * as cs from "./Popover.css.js";

interface Props {
  children: ReactNode;
}
export default function Popover({ children }: Props) {
  return <PopoverRAC className={cs.Popover.root}>{children}</PopoverRAC>;
}
