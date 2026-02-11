import type { ReactNode } from "react";
import classnames from "../../../utils/classnames.js";
import * as cs from "./ModalDialog.css.js";

interface Props {
  align?: "start" | "end";
  className?: string | undefined;
  children: ReactNode;
}
export default function Actions({ align = "end", className, children }: Props) {
  return (
    <div
      className={classnames(cs.Actions.root, className)}
      style={{ justifyContent: align === "start" ? "flex-start" : "flex-end" }}
    >
      {children}
    </div>
  );
}
