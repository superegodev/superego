import type { ReactNode } from "react";
import Panel from "./Panel.js";
import * as cs from "./Shell.css.js";
import { ShellProvider } from "./useShell.js";

interface Props {
  locale: string;
  direction: string;
  children: ReactNode;
}
export default function Shell({ locale, direction, children }: Props) {
  return (
    <ShellProvider>
      {({ isPrimarySidebarOpen }) => (
        <div
          lang={locale}
          dir={direction}
          className={cs.Shell.root}
          data-primary-sidebar-open={isPrimarySidebarOpen ? "true" : "false"}
        >
          {children}
        </div>
      )}
    </ShellProvider>
  );
}

Shell.Panel = Panel;
