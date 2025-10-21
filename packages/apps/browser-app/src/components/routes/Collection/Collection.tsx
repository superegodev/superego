import type { AppId, CollectionId } from "@superego/backend";
import { useState } from "react";
import {
  PiCode,
  PiGear,
  PiPlus,
  PiPushPin,
  PiShapes,
  PiShapesFill,
  PiTable,
  PiTableFill,
  PiWatch,
  PiWatchFill,
} from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import {
  listDocumentsQuery,
  useTriggerCollectionDownSync,
  useUpdateCollectionSettings,
} from "../../../business-logic/backend/hooks.js";
import useAuthenticateCollectionConnector from "../../../business-logic/backend/useAuthenticateCollectionConnector.js";
import type Route from "../../../business-logic/navigation/Route.js";
import {
  CollectionRouteView,
  RouteName,
} from "../../../business-logic/navigation/Route.js";
import ScreenSize from "../../../business-logic/screen-size/ScreenSize.js";
import useScreenSize from "../../../business-logic/screen-size/useScreenSize.js";
import ToastType from "../../../business-logic/toasts/ToastType.js";
import toastQueue from "../../../business-logic/toasts/toastQueue.js";
import AppUtils from "../../../utils/AppUtils.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import PanelHeaderActionSeparator from "../../design-system/Shell/PanelHeaderActionSeparator.js";
import Shell from "../../design-system/Shell/Shell.js";
import AppRenderer from "../../widgets/AppRenderer/AppRenderer.jsx";
import DocumentsTable from "../../widgets/DocumentsTable/DocumentsTable.js";
import * as cs from "./Collection.css.js";
import DownSyncInfoModal from "./DownSyncInfoModal.js";
import getDownSyncAction from "./getDownSyncAction.js";
import usePollForDownSyncFinished from "./usePollForDownSyncFinished.js";

type Props =
  | { collectionId: CollectionId }
  | { collectionId: CollectionId; view: CollectionRouteView.Table }
  | { collectionId: CollectionId; view: CollectionRouteView.App; appId: AppId };
export default function Collection(props: Props) {
  const { collectionId } = props;
  const intl = useIntl();
  const screenSize = useScreenSize();
  const { apps, collections } = useGlobalData();

  const collection = CollectionUtils.findCollection(collections, collectionId);

  const appId =
    "view" in props
      ? props.view === CollectionRouteView.Table
        ? null
        : props.appId
      : (collection?.settings.defaultCollectionViewAppId ?? null);
  const app = appId ? AppUtils.findApp(apps, appId) : null;

  const [showTimestamps, setShowTimestamps] = useState(false);

  const [isDownSyncInfoModalOpen, setDownSyncInfoModalOpen] = useState(false);
  const { mutate: triggerDownSync } = useTriggerCollectionDownSync();

  const authenticateConnector = useAuthenticateCollectionConnector();
  usePollForDownSyncFinished(collection);

  const { mutate } = useUpdateCollectionSettings();
  const setAsDefaultView = async () => {
    const { success, error } = await mutate(collection!.id, {
      defaultCollectionViewAppId: appId,
    });
    if (!success) {
      console.error(error);
      toastQueue.add(
        {
          type: ToastType.Error,
          title: intl.formatMessage({
            defaultMessage: "Error setting the default collection view",
          }),
          description: error.name,
        },
        { timeout: 5_000 },
      );
    }
  };

  return collection ? (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={CollectionUtils.getDisplayName(collection)}
        actionsAriaLabel={intl.formatMessage({
          defaultMessage: "Collection actions",
        })}
        actions={[
          !app && screenSize > ScreenSize.Medium
            ? {
                label: intl.formatMessage({
                  defaultMessage: "Show timestamps",
                }),
                icon: showTimestamps ? <PiWatchFill /> : <PiWatch />,
                onPress: () => setShowTimestamps(!showTimestamps),
              }
            : null,
          app
            ? {
                label: intl.formatMessage({
                  defaultMessage: "Edit app",
                }),
                icon: <PiCode />,
                to: { name: RouteName.EditApp, appId: app.id },
              }
            : null,
          (
            app
              ? app.id !== collection.settings.defaultCollectionViewAppId
              : collection.settings.defaultCollectionViewAppId !== null
          )
            ? {
                label: intl.formatMessage({
                  defaultMessage: "Set as default view",
                }),
                icon: <PiPushPin />,
                onPress: setAsDefaultView,
              }
            : null,
          PanelHeaderActionSeparator,
          {
            label: intl.formatMessage({ defaultMessage: "Table view" }),
            icon: app ? <PiTable /> : <PiTableFill />,
            to: {
              name: RouteName.Collection,
              collectionId,
              view: CollectionRouteView.Table,
            },
          },
          {
            label: intl.formatMessage({ defaultMessage: "Apps" }),
            icon: app ? <PiShapesFill /> : <PiShapes />,
            menuItems: [
              ...CollectionUtils.getApps(collection, apps).map(
                (collectionApp) => ({
                  key: collectionApp.id,
                  label: collectionApp.name,
                  to: {
                    name: RouteName.Collection,
                    collectionId,
                    view: CollectionRouteView.App,
                    appId: collectionApp.id,
                  } as const satisfies Route,
                  isActive: app !== null && app.id === collectionApp.id,
                }),
              ),
              {
                key: "CreateApp",
                label: (
                  <span>
                    <PiPlus />
                    {"\u2002"}
                    <FormattedMessage defaultMessage="Create new" />
                  </span>
                ),
                to: {
                  name: RouteName.CreateApp,
                  collectionIds: [collection.id],
                },
              },
            ],
          },
          PanelHeaderActionSeparator,
          CollectionUtils.hasRemote(collection)
            ? getDownSyncAction(
                collection,
                intl,
                () => triggerDownSync(collection.id),
                () => setDownSyncInfoModalOpen(true),
                () => authenticateConnector(collection),
              )
            : null,
          {
            label: intl.formatMessage({ defaultMessage: "Settings" }),
            icon: <PiGear />,
            to: {
              name: RouteName.CollectionSettings,
              collectionId: collectionId,
            },
          },
          !CollectionUtils.hasRemote(collection)
            ? {
                label: intl.formatMessage({
                  defaultMessage: "Create document",
                }),
                icon: <PiPlus />,
                to: {
                  name: RouteName.CreateDocument,
                  collectionId: collectionId,
                },
              }
            : null,
        ]}
      />
      <Shell.Panel.Content
        fullWidth={true}
        className={cs.Collection.panelContent}
      >
        {app ? (
          <AppRenderer app={app} />
        ) : (
          <DataLoader queries={[listDocumentsQuery([collectionId])]}>
            {(documents) => (
              <DocumentsTable
                collectionId={collectionId}
                collection={collection}
                documents={documents}
                showCreatedAt={showTimestamps}
                showLastModifiedAt={showTimestamps}
                className={cs.Collection.documentsTable}
              />
            )}
          </DataLoader>
        )}
        {CollectionUtils.hasRemote(collection) ? (
          <DownSyncInfoModal
            collection={collection}
            isOpen={isDownSyncInfoModalOpen}
            onClose={() => setDownSyncInfoModalOpen(false)}
            onTriggerDownSync={() => triggerDownSync(collection.id)}
          />
        ) : null}
      </Shell.Panel.Content>
    </Shell.Panel>
  ) : null;
}
