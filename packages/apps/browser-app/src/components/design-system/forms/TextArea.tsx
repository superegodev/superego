import type { RefAttributes } from "react";
import {
  type TextAreaProps,
  TextArea as TextAreaRAC,
} from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./forms.css.js";

interface Props extends TextAreaProps {
  className?: string | undefined;
}
export default function TextArea({
  className,
  ...props
}: Props & RefAttributes<HTMLTextAreaElement>) {
  return (
    <TextAreaRAC
      {...props}
      className={classnames(cs.TextArea.root, className)}
    />
  );
}
