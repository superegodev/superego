import type { ReactNode } from "react";
import classnames from "../../../utils/classnames.js";
import * as cs from "./InlineCode.css.js";

interface Props {
  className?: string | undefined;
  children: ReactNode;
}
export default function InlineCode({ className, children }: Props) {
  return (
    <code className={classnames(cs.InlineCode.root, className)}>
      {children}
    </code>
  );
}
