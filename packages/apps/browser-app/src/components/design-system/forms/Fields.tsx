import type { DetailedHTMLProps, HTMLAttributes } from "react";
import classnames from "../../../utils/classnames.js";
import * as cs from "./forms.css.js";

interface Props {
  className?: string | undefined;
}
export default function Fields({
  className,
  ref,
  ...props
}: Props & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  return (
    <div
      {...props}
      ref={ref}
      className={classnames(cs.Fields.root, className)}
    />
  );
}
