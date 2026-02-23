import type { ReactNode } from "react";
import classnames from "../../../utils/classnames.js";
import * as cs from "./Shell.css.js";

interface Props {
  fullWidth?: boolean | undefined;
  noBlockStartPadding?: boolean | undefined;
  className?: string | undefined;
  children: ReactNode;
}
export default function PanelContent({
  fullWidth = false,
  noBlockStartPadding = false,
  className,
  children,
}: Props) {
  return (
    <div
      className={classnames(cs.PanelContent.root, className)}
      data-full-width={fullWidth}
      data-no-block-start-padding={noBlockStartPadding}
    >
      {children}
    </div>
  );
}
