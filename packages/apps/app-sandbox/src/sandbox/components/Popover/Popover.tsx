import clsx from "clsx";
import type { ReactNode } from "react";
import { Popover as PopoverRAC } from "react-aria-components";
import * as cs from "./Popover.css.js";

interface Props {
  maxHeight?: number | undefined;
  className?: string | undefined;
  children: ReactNode;
}
export default function Popover({ maxHeight, className, children }: Props) {
  return (
    <PopoverRAC
      className={clsx(cs.Popover.root, className)}
      maxHeight={maxHeight}
    >
      {children}
    </PopoverRAC>
  );
}
