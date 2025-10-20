import type { AppId, CollectionId } from "@superego/backend";
import { useState } from "react";
import {
  PiCode,
  PiGear,
  PiPlus,
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
} from "../../../business-logic/backend/hooks.js";
import useAuthenticateCollectionConnector from "../../../business-logic/backend/useAuthenticateCollectionConnector.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import ScreenSize from "../../../business-logic/screen-size/ScreenSize.js";
import useScreenSize from "../../../business-logic/screen-size/useScreenSize.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import PanelHeaderActionSeparator from "../../design-system/Shell/PanelHeaderActionSeparator.js";
import Shell from "../../design-system/Shell/Shell.js";
import DocumentsTable from "../../widgets/DocumentsTable/DocumentsTable.js";
import * as cs from "./Collection.css.js";
import DownSyncInfoModal from "./DownSyncInfoModal.js";
import getDownSyncAction from "./getDownSyncAction.js";
import usePollForDownSyncFinished from "./usePollForDownSyncFinished.js";

interface Props {
  collectionId: CollectionId;
  activeAppId?: AppId;
}
export default function Collection({ collectionId, activeAppId }: Props) {
  const intl = useIntl();
  const screenSize = useScreenSize();
  const { apps, collections } = useGlobalData();

  const collection = CollectionUtils.findCollection(collections, collectionId);

  const hasActiveApp = activeAppId !== undefined;

  const [showTimestamps, setShowTimestamps] = useState(false);

  const [isDownSyncInfoModalOpen, setDownSyncInfoModalOpen] = useState(false);
  const { mutate: triggerDownSync } = useTriggerCollectionDownSync();

  const authenticateConnector = useAuthenticateCollectionConnector();
  usePollForDownSyncFinished(collection);

  return collection ? (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={CollectionUtils.getDisplayName(collection)}
        actionsAriaLabel={intl.formatMessage({
          defaultMessage: "Collection actions",
        })}
        actions={[
          hasActiveApp
            ? {
                label: intl.formatMessage({
                  defaultMessage: "Edit app",
                }),
                icon: <PiCode />,
                to: { name: RouteName.EditApp, appId: activeAppId },
              }
            : null,
          screenSize > ScreenSize.Medium && !hasActiveApp
            ? {
                label: intl.formatMessage({
                  defaultMessage: "Show timestamps",
                }),
                icon: showTimestamps ? <PiWatchFill /> : <PiWatch />,
                onPress: () => setShowTimestamps(!showTimestamps),
              }
            : null,
          PanelHeaderActionSeparator,
          {
            label: intl.formatMessage({ defaultMessage: "Table view" }),
            icon: hasActiveApp ? <PiTable /> : <PiTableFill />,
            to: { name: RouteName.Collection, collectionId },
          },
          {
            label: intl.formatMessage({ defaultMessage: "Apps" }),
            icon: hasActiveApp ? <PiShapesFill /> : <PiShapes />,
            menuItems: [
              ...CollectionUtils.getApps(collection, apps).map((app) => ({
                key: app.id,
                label: app.name,
                to: {
                  name: RouteName.Collection,
                  collectionId,
                  activeAppId: app.id,
                } as const,
              })),
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
          PanelHeaderActionSeparator,
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
        {hasActiveApp ? (
          // TODO
          <div>{activeAppId}</div>
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
