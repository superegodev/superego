import type { ReactNode } from "react";
import classnames from "../../../utils/classnames.js";
import * as cs from "./Shell.css.js";

interface Props {
  className?: string | undefined;
  children: ReactNode;
}
export default function PanelContent({ className, children }: Props) {
  return (
    <div className={classnames(cs.PanelContent.root, className)}>
      {children}
    </div>
  );
}
