import type { ReactNode, RefAttributes } from "react";
import { Text, type TextProps } from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./forms.css.js";

interface Props extends TextProps {
  className?: string | undefined;
  children: ReactNode;
}
export default function Description({
  className,
  ...props
}: Props & RefAttributes<HTMLElement>) {
  return (
    <Text
      {...props}
      className={classnames(cs.Description.root, className)}
      slot="description"
    />
  );
}
