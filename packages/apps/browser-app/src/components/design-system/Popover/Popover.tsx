import type { ReactNode, RefAttributes } from "react";
import {
  OverlayArrow,
  type PopoverProps,
  Popover as PopoverRAC,
} from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./Popover.css.js";

interface Props extends Omit<PopoverProps, "children"> {
  className?: string | undefined;
  children?: ReactNode;
}
export default function Popover({
  className,
  children,
  ...props
}: Props & RefAttributes<HTMLElement>) {
  return (
    <PopoverRAC {...props} className={classnames(cs.Popover.root, className)}>
      <OverlayArrow>
        <svg
          className={cs.Popover.arrow}
          width={12}
          height={12}
          viewBox="0 0 12 12"
        >
          <path d="M0 0 L6 6 L12 0" />
        </svg>
      </OverlayArrow>
      {children}
    </PopoverRAC>
  );
}
