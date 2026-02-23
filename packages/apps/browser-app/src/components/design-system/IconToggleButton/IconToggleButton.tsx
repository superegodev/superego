import type { RefAttributes } from "react";
import type { Placement } from "react-aria";
import {
  ToggleButton,
  type ToggleButtonProps,
  TooltipTrigger,
} from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import Tooltip from "../Tooltip/Tooltip.js";
import { iconToggleButtonRoot } from "./IconToggleButton.css.js";

type Props = {
  label: string;
  tooltipPlacement?: Placement | undefined;
  tooltipDelay?: number | undefined;
  tooltipCloseDelay?: number | undefined;
  className?: string | undefined;
} & Omit<ToggleButtonProps, "className" | "aria-label">;
export default function IconToggleButton({
  label,
  tooltipPlacement,
  tooltipDelay,
  tooltipCloseDelay,
  className,
  ...props
}: Props & RefAttributes<HTMLButtonElement>) {
  return (
    <TooltipTrigger delay={tooltipDelay} closeDelay={tooltipCloseDelay}>
      <ToggleButton
        {...props}
        aria-label={label}
        className={classnames(iconToggleButtonRoot, className)}
      />
      <Tooltip placement={tooltipPlacement}>{label}</Tooltip>
    </TooltipTrigger>
  );
}
