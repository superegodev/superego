import type { RefAttributes } from "react";
import {
  type TextFieldProps,
  TextField as TextFieldRAC,
} from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./forms.css.js";

interface Props extends TextFieldProps {
  className?: string | undefined;
}
export default function TextField({
  className,
  ...props
}: Props & RefAttributes<HTMLDivElement>) {
  return (
    <TextFieldRAC
      {...props}
      className={classnames(cs.TextField.root, className)}
    />
  );
}
