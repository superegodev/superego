import { PiGear, PiHouse, PiMagnifyingGlass } from "react-icons/pi";
import { FormattedMessage } from "react-intl";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import Shell from "../../design-system/Shell/Shell.js";
import CollectionsTree from "../../widgets/CollectionsTree/CollectionsTree.js";
import PrimarySidebarPanelAction from "./PrimarySidebarPanelAction.js";
import * as cs from "./Root.css.js";

export default function PrimarySidebarPanel() {
  return (
    <Shell.Panel slot="PrimarySidebar">
      <Shell.Panel.Content className={cs.PrimarySidebarPanel.root}>
        <div className={cs.PrimarySidebarPanel.topActions}>
          <PrimarySidebarPanelAction type="link" to={{ name: RouteName.Home }}>
            <PiHouse />
            <FormattedMessage defaultMessage="Home" />
          </PrimarySidebarPanelAction>
          <PrimarySidebarPanelAction type="button" onPress={() => {}}>
            <PiMagnifyingGlass />
            <FormattedMessage defaultMessage="Search" />
          </PrimarySidebarPanelAction>
        </div>
        <CollectionsTree className={cs.PrimarySidebarPanel.collectionsTree} />
        <div className={cs.PrimarySidebarPanel.bottomActions}>
          <PrimarySidebarPanelAction
            type="link"
            to={{ name: RouteName.GlobalSettings }}
          >
            <PiGear />
            <FormattedMessage defaultMessage="Settings" />
          </PrimarySidebarPanelAction>
        </div>
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}
