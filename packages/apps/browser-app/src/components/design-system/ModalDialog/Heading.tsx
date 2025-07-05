import type { RefAttributes } from "react";
import {
  type HeadingProps,
  Heading as HeadingRAC,
} from "react-aria-components";
import classnames from "../../../utils/classnames.js";
import * as cs from "./ModalDialog.css.js";

interface Props extends Omit<HeadingProps, "slot"> {
  className?: string | undefined;
}
export default function Heading({
  className,
  ...props
}: Props & RefAttributes<HTMLHeadingElement>) {
  return (
    <HeadingRAC
      {...props}
      slot="title"
      className={classnames(cs.Heading.root, className)}
    />
  );
}
