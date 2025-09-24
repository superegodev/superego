import type { ReactNode } from "react";
import classnames from "../../../utils/classnames.js";
import * as cs from "./Shell.css.js";

interface Props {
  fullWidth?: boolean | undefined;
  className?: string | undefined;
  children: ReactNode;
}
export default function PanelContent({
  fullWidth = false,
  className,
  children,
}: Props) {
  return (
    <div
      className={classnames(cs.PanelContent.root, className)}
      data-full-width={fullWidth}
    >
      {children}
    </div>
  );
}
