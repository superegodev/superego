import type { RefAttributes } from "react";
import { type LabelProps, Label as LabelRAC } from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./forms.css.js";

interface Props extends LabelProps {
  className?: string | undefined;
}
export default function Label({
  className,
  ...props
}: Props & RefAttributes<HTMLLabelElement>) {
  return (
    <LabelRAC {...props} className={classnames(cs.Label.root, className)} />
  );
}
