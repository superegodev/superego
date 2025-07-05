import type { CollectionId, DocumentId } from "@superego/backend";
import { useState } from "react";
import { PiFloppyDisk, PiTrash } from "react-icons/pi";
import { useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { getDocumentQuery } from "../../../business-logic/backend/hooks.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import DocumentUtils from "../../../utils/DocumentUtils.js";
import Shell from "../../design-system/Shell/Shell.js";
import CreateNewDocumentVersionForm from "./CreateNewDocumentVersionForm.js";
import DeleteDocumentModalForm from "./DeleteDocumentModalForm.js";

interface Props {
  collectionId: CollectionId;
  documentId: DocumentId;
}
export default function Document({ collectionId, documentId }: Props) {
  const intl = useIntl();
  const createFormId = `CreateNewDocumentVersionForm_${documentId}`;
  const [isCreateFormSubmitDisabled, setIsCreateFormSubmitDisabled] =
    useState(true);
  const { collections } = useGlobalData();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const collection = CollectionUtils.findCollection(collections, collectionId);
  return collection ? (
    <DataLoader queries={[getDocumentQuery(collection.id, documentId)]}>
      {(document) => (
        <Shell.Panel slot="Main">
          <Shell.Panel.Header
            title={intl.formatMessage(
              { defaultMessage: "{collection} » {document}" },
              {
                collection: CollectionUtils.getDisplayName(collection),
                document: DocumentUtils.getDisplayName(document),
              },
            )}
            actionsAriaLabel={intl.formatMessage({
              defaultMessage: "Document actions",
            })}
            actions={[
              {
                label: intl.formatMessage({ defaultMessage: "Save" }),
                icon: <PiFloppyDisk />,
                submit: createFormId,
                isDisabled: isCreateFormSubmitDisabled,
              },
              {
                label: intl.formatMessage({
                  defaultMessage: "Delete document",
                }),
                icon: <PiTrash />,
                onPress: () => setIsDeleteModalOpen(true),
              },
            ]}
          />
          <Shell.Panel.Content>
            <CreateNewDocumentVersionForm
              key={createFormId}
              collection={collection}
              document={document}
              formId={createFormId}
              setSubmitDisabled={setIsCreateFormSubmitDisabled}
            />
            <DeleteDocumentModalForm
              key={`DeleteDocumentModalForm_${documentId}`}
              document={document}
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
            />
          </Shell.Panel.Content>
        </Shell.Panel>
      )}
    </DataLoader>
  ) : null;
}
