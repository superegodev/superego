import type { RefAttributes } from "react";
import type { Placement } from "react-aria";
import {
  Button,
  type ButtonProps,
  ToggleButton,
  type ToggleButtonProps,
  TooltipTrigger,
} from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import Tooltip from "../Tooltip/Tooltip.js";
import * as cs from "./IconButton.css.js";

type Props<IsToggle extends boolean = false> = {
  variant?: "default" | "primary" | "invisible" | undefined;
  label: string;
  isToggle?: IsToggle | undefined;
  tooltipPlacement?: Placement | undefined;
  tooltipDelay?: number | undefined;
  tooltipCloseDelay?: number | undefined;
  className?: string | undefined;
} & Omit<
  IsToggle extends true ? ToggleButtonProps : ButtonProps,
  "className" | "aria-label"
>;
export default function IconButton<IsToggle extends boolean = false>({
  variant = "default",
  label,
  isToggle,
  tooltipPlacement,
  tooltipDelay,
  tooltipCloseDelay,
  className,
  ...props
}: Props<IsToggle> & RefAttributes<HTMLButtonElement>) {
  const Component = isToggle ? ToggleButton : Button;
  return (
    <TooltipTrigger delay={tooltipDelay} closeDelay={tooltipCloseDelay}>
      <Component
        // props has the correct type, but TypeScript cannot infer it. Hence the
        // case as any.
        {...(props as any)}
        aria-label={label}
        className={classnames(cs.IconButton.root[variant], className)}
      />
      <Tooltip placement={tooltipPlacement}>{label}</Tooltip>
    </TooltipTrigger>
  );
}
