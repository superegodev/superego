import type { ReactNode } from "react";
import { PiWarningCircleFill } from "react-icons/pi";
import * as cs from "./ManualMode.css.js";

interface Props {
  hasErrors: boolean;
  children: ReactNode;
}
export default function TabTitle({ hasErrors, children }: Props) {
  return (
    <div className={cs.TabTitle.root}>
      {children}
      {hasErrors ? <PiWarningCircleFill className={cs.TabTitle.icon} /> : null}
    </div>
  );
}
