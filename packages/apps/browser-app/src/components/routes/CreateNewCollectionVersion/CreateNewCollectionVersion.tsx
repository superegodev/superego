import type { CollectionId } from "@superego/backend";
import { useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import Shell from "../../design-system/Shell/Shell.js";
import CreateNewCollectionVersionForm from "./CreateNewCollectionVersionForm.js";

interface Props {
  collectionId: CollectionId;
}
export default function CreateNewCollectionVersion({ collectionId }: Props) {
  const intl = useIntl();
  const { collections } = useGlobalData();
  const collection = CollectionUtils.findCollection(collections, collectionId);

  if (!collection) {
    return null;
  }

  return (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={intl.formatMessage(
          { defaultMessage: "{collection} » Create New Version" },
          { collection: CollectionUtils.getDisplayName(collection) },
        )}
      />
      <Shell.Panel.Content>
        <CreateNewCollectionVersionForm
          key={`CreateNewCollectionVersionForm_${collectionId}`}
          collection={collection}
        />
      </Shell.Panel.Content>
    </Shell.Panel>
  );
}
