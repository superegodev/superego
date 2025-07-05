import type { ReactNode } from "react";
import Panel from "./Panel.js";
import * as cs from "./Shell.css.js";

interface Props {
  locale: string;
  direction: string;
  children: ReactNode;
}
export default function Shell({ locale, direction, children }: Props) {
  return (
    <div lang={locale} dir={direction} className={cs.Shell.root}>
      {children}
    </div>
  );
}

Shell.Panel = Panel;
