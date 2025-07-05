import type { ReactNode, RefAttributes } from "react";
import { type RadioProps, Radio as RadioRAC } from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./forms.css.js";

interface Props extends RadioProps {
  className?: string | undefined;
  children: ReactNode;
}
export default function Radio({
  className,
  ...props
}: Props & RefAttributes<HTMLLabelElement>) {
  return (
    <RadioRAC {...props} className={classnames(cs.Radio.root, className)} />
  );
}
