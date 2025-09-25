import type { CollectionId } from "@superego/backend";
import { useState } from "react";
import { PiGear, PiPlus, PiWatch, PiWatchFill } from "react-icons/pi";
import { useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { listDocumentsQuery } from "../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import Shell from "../../design-system/Shell/Shell.js";
import DocumentsTable from "../../widgets/DocumentsTable/DocumentsTable.js";
import * as cs from "./Collection.css.js";

interface Props {
  collectionId: CollectionId;
}
export default function Collection({ collectionId }: Props) {
  const intl = useIntl();
  const { collections } = useGlobalData();
  const [showTimestamps, setShowTimestamps] = useState(false);
  const collection = CollectionUtils.findCollection(collections, collectionId);
  return collection ? (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={CollectionUtils.getDisplayName(collection)}
        actionsAriaLabel={intl.formatMessage({
          defaultMessage: "Collection actions",
        })}
        actions={[
          {
            label: intl.formatMessage({ defaultMessage: "Show timestamps" }),
            icon: showTimestamps ? <PiWatchFill /> : <PiWatch />,
            onPress: () => setShowTimestamps(!showTimestamps),
          },
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
      </Shell.Panel.Content>
    </Shell.Panel>
  ) : null;
}
