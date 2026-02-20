import clsx from "clsx";
import type { CSSProperties } from "react";
import { Button, TooltipTrigger } from "react-aria-components";
import {
  PiArchive,
  PiCaretDown,
  PiCaretLeft,
  PiCaretRight,
  PiCaretUp,
  PiCheck,
  PiMinus,
  PiPlus,
  PiTrash,
  PiX,
} from "react-icons/pi";
import Tooltip from "../Tooltip/Tooltip.js";
import * as cs from "./IconButton.css.js";

const icons = {
  "caret-up": PiCaretUp,
  "caret-down": PiCaretDown,
  "caret-left": PiCaretLeft,
  "caret-right": PiCaretRight,
  check: PiCheck,
  plus: PiPlus,
  minus: PiMinus,
  x: PiX,
  trash: PiTrash,
  archive: PiArchive,
} as const;

interface Props {
  variant?: "default" | "primary" | "invisible" | undefined;
  shape?: "square" | "circle" | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  icon: keyof typeof icons;
  label: string;
  onPress?: (() => void) | undefined;
  style?: CSSProperties | undefined;
  /** @internal */
  slot?: string | null | undefined;
  /** @internal */
  className?: string | undefined;
}
export default function IconButton({
  variant = "default",
  shape = "square",
  size = "md",
  icon,
  label,
  onPress,
  style = {},
  slot,
  className,
}: Props) {
  const IconComponent = icons[icon];
  return (
    <TooltipTrigger>
      <Button
        onPress={onPress}
        aria-label={label}
        className={clsx(
          cs.IconButton.root[variant],
          cs.IconButton.root[size],
          className,
        )}
        style={{
          borderRadius: shape === "circle" ? "100%" : undefined,
          ...style,
        }}
        slot={slot}
      >
        <IconComponent />
      </Button>
      <Tooltip>{label}</Tooltip>
    </TooltipTrigger>
  );
}
