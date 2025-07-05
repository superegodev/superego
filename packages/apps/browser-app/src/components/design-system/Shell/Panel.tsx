import type { ReactNode } from "react";
import PanelContent from "./PanelContent.js";
import PanelHeader from "./PanelHeader.js";
import * as cs from "./Shell.css.js";

interface Props {
  slot: "PrimarySidebar" | "Main";
  children: ReactNode;
}
export default function Panel({ slot, children }: Props) {
  return (
    <div className={cs.Panel.root} data-slot={slot} style={{ gridArea: slot }}>
      {children}
    </div>
  );
}

Panel.Header = PanelHeader;
Panel.Content = PanelContent;
