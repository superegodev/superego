import type { CollectionId } from "@superego/backend";
import { useState } from "react";
import { PiFloppyDiskFill } from "react-icons/pi";
import { useIntl } from "react-intl";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import useApplyAlwaysCollapsePrimarySidebar from "../../../business-logic/navigation/useApplyAlwaysCollapsePrimarySidebar.js";
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
  const createFormId = `CreateDocumentForm_${collectionId}`;
  const [isCreateFormSubmitDisabled, setIsCreateFormSubmitDisabled] =
    useState(false);
  useApplyAlwaysCollapsePrimarySidebar(
    collection?.latestVersion.settings.defaultDocumentViewUiOptions
      ?.alwaysCollapsePrimarySidebar,
  );
  return collection ? (
    <Shell.Panel slot="Main">
      <Shell.Panel.Header
        title={intl.formatMessage(
          { defaultMessage: "{collection} » Create Document" },
          { collection: CollectionUtils.getDisplayName(collection) },
        )}
        actionsAriaLabel={intl.formatMessage({
          defaultMessage: "Create document actions",
        })}
        actions={[
          {
            label: intl.formatMessage({ defaultMessage: "Create" }),
            icon: <PiFloppyDiskFill />,
            submit: createFormId,
            isDisabled: isCreateFormSubmitDisabled,
            isPrimary: true,
          },
        ]}
      />
      <Shell.Panel.Content
        fullWidth={
          collection.latestVersion.settings.defaultDocumentViewUiOptions
            ?.fullWidth
        }
      >
        <CreateDocumentForm
          key={`CreateDocumentForm_${collectionId}`}
          collection={collection}
          formId={createFormId}
          setSubmitDisabled={setIsCreateFormSubmitDisabled}
        />
      </Shell.Panel.Content>
    </Shell.Panel>
  ) : null;
}
