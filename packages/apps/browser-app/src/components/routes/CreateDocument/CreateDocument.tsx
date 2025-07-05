import type { CollectionId } from "@superego/backend";
import { useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import Shell from "../../design-system/Shell/Shell.js";
import CreateDocumentForm from "./CreateDocumentForm.js";

interface Props {
  collectionId: CollectionId;
}
export default function CreateDocument({ collectionId }: Props) {
  const intl = useIntl();
  const { collections } = useGlobalData();
  const collection = CollectionUtils.findCollection(collections, collectionId);
  return collection ? (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={intl.formatMessage(
          { defaultMessage: "{collection} » Create Document" },
          { collection: CollectionUtils.getDisplayName(collection) },
        )}
      />
      <Shell.Panel.Content>
        <CreateDocumentForm
          key={`CreateDocumentForm_${collectionId}`}
          collection={collection}
        />
      </Shell.Panel.Content>
    </Shell.Panel>
  ) : null;
}
