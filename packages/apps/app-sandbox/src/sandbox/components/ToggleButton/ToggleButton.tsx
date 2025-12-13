import { assignInlineVars } from "@vanilla-extract/dynamic";
import clsx from "clsx";
import type { ReactNode } from "react";
import { ToggleButton as ToggleButtonRAC } from "react-aria-components";
import * as cs from "./ToggleButton.css.js";

interface Props {
  color?: `#${string}`;
  size?: "sm" | "md" | "lg" | undefined;
  fullWidth?: boolean | undefined;
  value: boolean;
  onChange: (newValue: boolean) => void;
  /** @internal */
  className?: string | undefined;
  children: ReactNode;
}
export default function ToggleButton({
  color,
  size = "md",
  fullWidth = false,
  value,
  onChange,
  className,
  children,
}: Props) {
  const style =
    fullWidth || color
      ? assignInlineVars({
          width: fullWidth ? "100%" : undefined,
          ...(color ? { [cs.baseColorVar]: color } : {}),
        })
      : undefined;

  return (
    <ToggleButtonRAC
      onChange={onChange}
      className={clsx(
        cs.ToggleButton.root[value ? "selected" : "notSelected"],
        cs.ToggleButton.root[size],
        className,
      )}
      style={style}
    >
      {children}
    </ToggleButtonRAC>
  );
}
