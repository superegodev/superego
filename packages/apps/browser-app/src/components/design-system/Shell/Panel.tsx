import type { ReactNode } from "react";
import useShell from "../../../business-logic/navigation/useShell.js";
import classnames from "../../../utils/classnames.js";
import PanelContent from "./PanelContent.js";
import PanelHeader from "./PanelHeader.js";
import * as cs from "./Shell.css.js";

interface Props {
  slot: "PrimarySidebar" | "Main";
  className?: string | undefined;
  children: ReactNode;
}
export default function Panel({ slot, className, children }: Props) {
  const { isPrimarySidebarOpen, closePrimarySidebar } = useShell();
  const onMainPanelInteraction =
    isPrimarySidebarOpen && slot === "Main" ? closePrimarySidebar : undefined;
  return (
    <div
      className={classnames(cs.Panel.root, className)}
      data-slot={slot}
      style={{ gridArea: slot }}
      onClick={onMainPanelInteraction}
      onFocus={onMainPanelInteraction}
      onKeyDown={onMainPanelInteraction}
    >
      {children}
    </div>
  );
}

Panel.Header = PanelHeader;
Panel.Content = PanelContent;
