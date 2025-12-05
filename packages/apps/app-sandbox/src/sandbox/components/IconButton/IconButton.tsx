import clsx from "clsx";
import { Button, TooltipTrigger } from "react-aria-components";
import {
  PiCaretDown,
  PiCaretLeft,
  PiCaretRight,
  PiCaretUp,
  PiCheck,
  PiMinus,
  PiPlus,
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
} as const;

interface Props {
  variant?: "default" | "primary" | "invisible" | undefined;
  shape?: "square" | "round" | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  icon: keyof typeof icons;
  label: string;
  onPress?: (() => void) | undefined;
}
export default function Icon({
  variant = "default",
  shape = "square",
  size = "md",
  icon,
  label,
  onPress,
}: Props) {
  const IconComponent = icons[icon];
  return (
    <TooltipTrigger>
      <Button
        onPress={onPress}
        aria-label={label}
        className={clsx(cs.IconButton.root[variant], cs.IconButton.root[size])}
        style={{ borderRadius: shape === "round" ? "100%" : undefined }}
      >
        <IconComponent />
      </Button>
      <Tooltip>{label}</Tooltip>
    </TooltipTrigger>
  );
}
