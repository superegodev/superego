import type { ReactNode } from "react";
import {
  OverlayArrow,
  type TooltipProps,
  Tooltip as TooltipRAC,
} from "react-aria-components";
import * as cs from "./Tooltip.css.js";

interface Props extends TooltipProps {
  children: ReactNode;
}
export default function Tooltip({ children, ...props }: Props) {
  return (
    <TooltipRAC {...props} className={cs.Tooltip.root}>
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
