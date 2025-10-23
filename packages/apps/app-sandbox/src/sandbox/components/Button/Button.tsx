import type { RefAttributes } from "react";
import { type ButtonProps, Button as ButtonRAC } from "react-aria-components";
import * as cs from "./Button.css.js";

interface Props extends Omit<ButtonProps, "className"> {
  variant?: "default" | "primary" | "invisible" | "danger" | undefined;
}
export default function Button({
  variant = "default",
  ...props
}: Props & RefAttributes<HTMLButtonElement>) {
  return <ButtonRAC {...props} className={cs.Button.root[variant]} />;
}
