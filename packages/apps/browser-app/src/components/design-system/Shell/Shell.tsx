import type { ReactNode } from "react";
import useShell from "../../../business-logic/navigation/useShell.js";
import Panel from "./Panel.js";
import * as cs from "./Shell.css.js";

interface Props {
  locale: string;
  direction: string;
  children: ReactNode;
}
export default function Shell({ locale, direction, children }: Props) {
  const { isPrimarySidebarOpen } = useShell();
  return (
    <div
      lang={locale}
      dir={direction}
      className={cs.Shell.root}
      data-primary-sidebar-open={isPrimarySidebarOpen}
    >
      {children}
    </div>
  );
}

Shell.Panel = Panel;
