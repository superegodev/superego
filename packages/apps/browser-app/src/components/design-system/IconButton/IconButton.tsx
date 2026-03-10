import type { RefAttributes } from "react";
import type { Placement } from "react-aria";
import {
  Button,
  type ButtonProps,
  TooltipTrigger,
} from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import Tooltip from "../Tooltip/Tooltip.js";
import * as cs from "./IconButton.css.js";

type Props = {
  variant?:
    | "default"
    | "primary"
    | "invisible"
    | "invisible-danger"
    | undefined;
  label: string;
  tooltipPlacement?: Placement | undefined;
  tooltipDelay?: number | undefined;
  tooltipCloseDelay?: number | undefined;
  className?: string | undefined;
} & Omit<ButtonProps, "className" | "aria-label">;

export default function IconButton({
  variant = "default",
  label,
  tooltipPlacement,
  tooltipDelay,
  tooltipCloseDelay,
  className,
  ...props
}: Props & RefAttributes<HTMLButtonElement>) {
  return (
    <TooltipTrigger delay={tooltipDelay} closeDelay={tooltipCloseDelay}>
      <Button
        {...props}
        aria-label={label}
        className={classnames(cs.IconButton.root[variant], className)}
      />
      <Tooltip placement={tooltipPlacement}>{label}</Tooltip>
    </TooltipTrigger>
  );
}
