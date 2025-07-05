import type { ReactNode } from "react";
import classnames from "../../../utils/classnames.js";
import DisclosureTrigger from "./DisclosureTrigger.js";
import * as cs from "./Fieldset.css.js";

interface Props {
  className?: string | undefined;
  children: ReactNode;
  nonDisclosureTriggeringChildren?: ReactNode;
}
export default function Legend({
  className,
  children,
  nonDisclosureTriggeringChildren,
}: Props) {
  return (
    <legend className={classnames(cs.Legend.root, className)}>
      <DisclosureTrigger>{children}</DisclosureTrigger>
      {nonDisclosureTriggeringChildren}
    </legend>
  );
}
