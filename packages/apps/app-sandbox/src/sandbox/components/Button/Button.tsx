import clsx from "clsx";
import type { ReactNode } from "react";
import { Button as ButtonRAC } from "react-aria-components";
import * as cs from "./Button.css.js";

interface Props {
  variant?: "default" | "primary" | "invisible" | "danger" | undefined;
  size?: "sm" | "md" | "lg" | undefined;
  fullWidth?: boolean | undefined;
  onPress?: (() => void) | undefined;
  /** @internal */
  slot?: string | null | undefined;
  /** @internal */
  className?: string | undefined;
  children: ReactNode;
}
export default function Button({
  variant = "default",
  size = "md",
  fullWidth = false,
  onPress,
  slot,
  className,
  children,
}: Props) {
  return (
    <ButtonRAC
      onPress={onPress}
      slot={slot}
      className={clsx(cs.Button.root[variant], cs.Button.root[size], className)}
      style={{ width: fullWidth ? "100%" : undefined }}
    >
      {children}
    </ButtonRAC>
  );
}
