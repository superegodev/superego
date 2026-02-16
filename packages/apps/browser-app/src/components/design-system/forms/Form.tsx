import type { RefAttributes } from "react";
import { type FormProps, Form as FormRAC } from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./forms.css.js";

interface Props extends FormProps {
  className?: string | undefined;
}
export default function Form({
  className,
  ...props
}: Props & RefAttributes<HTMLFormElement>) {
  return <FormRAC {...props} className={classnames(cs.Form.root, className)} />;
}
