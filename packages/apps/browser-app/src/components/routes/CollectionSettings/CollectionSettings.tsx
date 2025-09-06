import type { CollectionId } from "@superego/backend";
import { useState } from "react";
import { PiTrash } from "react-icons/pi";
import { FormattedMessage, useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import FullPageTabs from "../../design-system/FullPageTabs/FullPageTabs.js";
import Shell from "../../design-system/Shell/Shell.js";
import CreateNewCollectionVersionForm from "./CreateNewCollectionVersionForm.js";
import DeleteCollectionModalForm from "./DeleteCollectionModalForm.js";
import UpdateCollectionSettingsForm from "./UpdateCollectionSettingsForm.js";
import UpdateCollectionVersionSettingsForm from "./UpdateCollectionVersionSettingsForm.js";

interface Props {
  collectionId: CollectionId;
}
export default function CollectionSettings({ collectionId }: Props) {
  const intl = useIntl();
  const { collections } = useGlobalData();
  const collection = CollectionUtils.findCollection(collections, collectionId);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!collection) {
    return null;
  }

  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={intl.formatMessage(
          { defaultMessage: "{collection} » Settings" },
          { collection: CollectionUtils.getDisplayName(collection) },
        )}
        actionsAriaLabel={intl.formatMessage({
          defaultMessage: "Collection actions",
        })}
        actions={[
          {
            label: intl.formatMessage({ defaultMessage: "Delete collection" }),
            icon: <PiTrash />,
            onPress: () => setIsDeleteModalOpen(true),
          },
        ]}
      />
      <Shell.Panel.Content>
        <FullPageTabs
          tabs={[
            {
              title: <FormattedMessage defaultMessage="General settings" />,
              panel: (
                <UpdateCollectionSettingsForm
                  key={`UpdateCollectionSettingsForm_${collectionId}`}
                  collection={collection}
                />
              ),
            },
            {
              title: (
                <FormattedMessage defaultMessage="Latest version settings" />
              ),
              panel: (
                <UpdateCollectionVersionSettingsForm
                  key={`UpdateCollectionVersionSettingsForm_${collectionId}`}
                  collection={collection}
                />
              ),
            },
            {
              title: <FormattedMessage defaultMessage="Create new version" />,
              panel: (
                <CreateNewCollectionVersionForm
                  key={`CreateNewCollectionVersionForm_${collectionId}`}
                  collection={collection}
                />
              ),
            },
          ]}
        />
        <DeleteCollectionModalForm
          key={`DeleteCollectionModalForm_${collectionId}`}
          collection={collection}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}
