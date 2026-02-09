import {
  PiArrowLeft,
  PiGear,
  PiListChecks,
  PiMagnifyingGlass,
  PiRobot,
  PiStorefront,
} from "react-icons/pi";
import { FormattedMessage } from "react-intl";
import { electronMainWorld } from "../../../business-logic/electron/electron.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import useSearchModalState from "../../../business-logic/search/useSearchModalState.js";
import Shell from "../../design-system/Shell/Shell.js";
import CollectionsTree from "../../widgets/CollectionsTree/CollectionsTree.js";
import PrimarySidebarPanelAction from "./PrimarySidebarPanelAction.js";
import * as cs from "./Root.css.js";

export default function PrimarySidebarPanel() {
  const { open: openSearchModal } = useSearchModalState();
  const { canGoBack, goBack } = useNavigationState();

  return (
    <Shell.Panel slot="PrimarySidebar">
      <Shell.Panel.Content
        fullWidth={true}
        className={cs.PrimarySidebarPanel.root}
      >
        <div className={cs.PrimarySidebarPanel.topActions}>
          {electronMainWorld.isElectron ? (
            <PrimarySidebarPanelAction
              type="button"
              onPress={goBack}
              isDisabled={!canGoBack}
            >
              <PiArrowLeft />
              <FormattedMessage defaultMessage="Back" />
            </PrimarySidebarPanelAction>
          ) : null}
          <PrimarySidebarPanelAction type="link" to={{ name: RouteName.Ask }}>
            <PiRobot />
            <FormattedMessage defaultMessage="Ask" />
          </PrimarySidebarPanelAction>
          <PrimarySidebarPanelAction
            type="button"
            onPress={() => openSearchModal()}
          >
            <PiMagnifyingGlass />
            <FormattedMessage defaultMessage="Search" />
          </PrimarySidebarPanelAction>
        </div>
        <CollectionsTree className={cs.PrimarySidebarPanel.collectionsTree} />
        <div className={cs.PrimarySidebarPanel.bottomActions}>
          <PrimarySidebarPanelAction
            type="link"
            to={{ name: RouteName.BackgroundJobs }}
          >
            <PiListChecks />
            <FormattedMessage defaultMessage="Background jobs" />
          </PrimarySidebarPanelAction>
          <PrimarySidebarPanelAction
            type="link"
            to={{ name: RouteName.Bazaar }}
          >
            <PiStorefront />
            <FormattedMessage defaultMessage="Bazaar" />
          </PrimarySidebarPanelAction>
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
