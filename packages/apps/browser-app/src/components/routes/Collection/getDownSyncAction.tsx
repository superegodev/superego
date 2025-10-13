import {
  type Collection,
  DownSyncStatus,
  type Remote,
} from "@superego/backend";
import {
  PiArrowsClockwise,
  PiCloudArrowDown,
  PiCloudCheck,
  PiCloudX,
  PiFingerprint,
} from "react-icons/pi";
import type { IntlShape } from "react-intl";
import toTitleCase from "../../../utils/toTitleCase.js";
import type PanelHeaderAction from "../../design-system/Shell/PanelHeaderAction.js";

export default function getDownSyncAction(
  collection: Collection & { remote: Remote },
  intl: IntlShape,
  triggerDownSync: () => void,
  openDownSyncInfoModal: () => void,
  authenticateConnector: () => void,
): PanelHeaderAction {
  if (!collection.remote.connectorAuthenticationState.isAuthenticated) {
    return {
      label: intl.formatMessage(
        { defaultMessage: "Authenticate with {remote}" },
        { remote: toTitleCase(collection.remote.connector.name) },
      ),
      icon: <PiFingerprint />,
      onPress: authenticateConnector,
    };
  }
  switch (collection.remote.syncState.down.status) {
    case DownSyncStatus.NeverSynced:
      return {
        label: intl.formatMessage({ defaultMessage: "Sync" }),
        icon: <PiCloudArrowDown />,
        onPress: triggerDownSync,
      };
    case DownSyncStatus.Syncing:
      return {
        label: intl.formatMessage({ defaultMessage: "Syncing" }),
        icon: <PiArrowsClockwise />,
        onPress: () => {},
      };
    case DownSyncStatus.LastSyncSucceeded:
      return {
        label: intl.formatMessage(
          {
            defaultMessage:
              "Last synced {lastSucceededAt, date, ::MMM d, HH:mm}",
          },
          { lastSucceededAt: collection.remote.syncState.down.lastSucceededAt },
        ),
        icon: <PiCloudCheck />,
        onPress: triggerDownSync,
      };
    case DownSyncStatus.LastSyncFailed:
      return {
        label: intl.formatMessage({ defaultMessage: "Last sync failed" }),
        icon: <PiCloudX />,
        onPress: openDownSyncInfoModal,
      };
  }
}
