import type { CollectionId } from "@superego/backend";
import { useState } from "react";
import { PiPlus, PiTrash } from "react-icons/pi";
import { useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import Section from "../../design-system/Section/Section.js";
import Shell from "../../design-system/Shell/Shell.js";
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
            label: intl.formatMessage({
              defaultMessage: "Create new version",
            }),
            icon: <PiPlus />,
            to: {
              name: RouteName.CreateCollectionVersion,
              collectionId: collectionId,
            },
          },
          {
            label: intl.formatMessage({ defaultMessage: "Delete collection" }),
            icon: <PiTrash />,
            onPress: () => setIsDeleteModalOpen(true),
          },
        ]}
      />
      <Shell.Panel.Content>
        <Section
          title={intl.formatMessage({ defaultMessage: "Settings" })}
          level={2}
        >
          <UpdateCollectionSettingsForm
            key={`UpdateCollectionSettingsForm_${collectionId}`}
            collection={collection}
          />
        </Section>
        <Section
          title={intl.formatMessage({ defaultMessage: "Version settings" })}
          level={2}
        >
          <UpdateCollectionVersionSettingsForm
            key={`UpdateCollectionVersionSettingsForm_${collectionId}`}
            collection={collection}
          />
        </Section>
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
