import type { RefAttributes } from "react";
import type { Placement } from "react-aria";
import { TooltipTrigger } from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import Link from "../Link/Link.js";
import Tooltip from "../Tooltip/Tooltip.js";
import * as cs from "./IconLink.css.js";

type LinkProps = Omit<Parameters<typeof Link>[0], "aria-label">;

interface Props extends LinkProps {
  variant: "invisible";
  label: string | undefined;
  tooltipPlacement?: Placement;
  tooltipDelay?: number | undefined;
  className?: string | undefined;
}
export default function IconLink({
  variant,
  label,
  tooltipPlacement,
  tooltipDelay,
  className,
  ...props
}: Props & RefAttributes<HTMLButtonElement>) {
  return (
    <TooltipTrigger delay={tooltipDelay}>
      <Link
        {...props}
        aria-label={label}
        className={classnames(cs.IconLink.root[variant], className)}
      />
      <Tooltip placement={tooltipPlacement}>{label}</Tooltip>
    </TooltipTrigger>
  );
}
