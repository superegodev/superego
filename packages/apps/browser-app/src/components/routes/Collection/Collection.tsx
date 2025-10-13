import type { CollectionId } from "@superego/backend";
import { useState } from "react";
import { PiGear, PiPlus, PiWatch, PiWatchFill } from "react-icons/pi";
import { useIntl } from "react-intl";
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
import Shell from "../../design-system/Shell/Shell.js";
import DocumentsTable from "../../widgets/DocumentsTable/DocumentsTable.js";
import * as cs from "./Collection.css.js";
import DownSyncInfoModal from "./DownSyncInfoModal.js";
import getDownSyncAction from "./getDownSyncAction.js";
import usePollForDownSyncFinished from "./usePollForDownSyncFinished.js";

interface Props {
  collectionId: CollectionId;
}
export default function Collection({ collectionId }: Props) {
  const intl = useIntl();
  const screenSize = useScreenSize();
  const { collections } = useGlobalData();
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [isDownSyncInfoModalOpen, setDownSyncInfoModalOpen] = useState(false);
  const { mutate: triggerDownSync } = useTriggerCollectionDownSync();
  const collection = CollectionUtils.findCollection(collections, collectionId);
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
          CollectionUtils.hasRemote(collection)
            ? getDownSyncAction(
                collection,
                intl,
                () => triggerDownSync(collection.id),
                () => setDownSyncInfoModalOpen(true),
                () => authenticateConnector(collection),
              )
            : null,
          screenSize > ScreenSize.Medium
            ? {
                label: intl.formatMessage({
                  defaultMessage: "Show timestamps",
                }),
                icon: showTimestamps ? <PiWatchFill /> : <PiWatch />,
                onPress: () => setShowTimestamps(!showTimestamps),
              }
            : null,
          {
            label: intl.formatMessage({ defaultMessage: "Settings" }),
            icon: <PiGear />,
            to: {
              name: RouteName.CollectionSettings,
              collectionId: collectionId,
            },
          },
          {
            label: intl.formatMessage({ defaultMessage: "Create document" }),
            icon: <PiPlus />,
            to: {
              name: RouteName.CreateDocument,
              collectionId: collectionId,
            },
          },
        ]}
      />
      <Shell.Panel.Content
        fullWidth={true}
        className={cs.Collection.panelContent}
      >
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
