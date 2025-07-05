import type { ReactNode } from "react";
import {
  OverlayArrow,
  type TooltipProps,
  Tooltip as TooltipRAC,
} from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./Tooltip.css.js";

interface Props extends TooltipProps {
  className?: string | undefined;
  children: ReactNode;
}
export default function Tooltip({ className, children, ...props }: Props) {
  return (
    <TooltipRAC {...props} className={classnames(cs.Tooltip.root, className)}>
      <OverlayArrow>
        <svg
          className={cs.Tooltip.arrow}
          width={8}
          height={8}
          viewBox="0 0 8 8"
        >
          <path d="M0 0 L4 4 L8 0" />
        </svg>
      </OverlayArrow>
      {children}
    </TooltipRAC>
  );
}
