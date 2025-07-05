import type { RefAttributes } from "react";
import { type ButtonProps, Button as ButtonRAC } from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./Button.css.js";

interface Props extends Omit<ButtonProps, "className"> {
  variant?: "default" | "primary" | "invisible" | "danger" | undefined;
  className?: string | undefined;
}
export default function Button({
  variant = "default",
  className,
  ...props
}: Props & RefAttributes<HTMLButtonElement>) {
  return (
    <ButtonRAC
      {...props}
      className={classnames(cs.Button.root[variant], className)}
    />
  );
}
