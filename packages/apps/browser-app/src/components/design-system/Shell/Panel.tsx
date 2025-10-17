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
  const {
    togglePrimarySidebarButtonId,
    isPrimarySidebarOpen,
    closePrimarySidebar,
  } = useShell();
  const onMainPanelInteraction =
    isPrimarySidebarOpen && slot === "Main"
      ? (evt: { target: EventTarget | null }) => {
          // Ignore if the event target is the the toggle sidebar button,
          // otherwise closing the sidebar disturbs keyboard navigation.
          // (Example: the sidebar closes as soon as the user presses any key,
          // but at least Shift+Tab are necessary to navigate to sidebar
          // elements.)
          if (
            !(
              evt.target &&
              "id" in evt.target &&
              evt.target.id === togglePrimarySidebarButtonId
            )
          ) {
            closePrimarySidebar();
          }
        }
      : undefined;
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
