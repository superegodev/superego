import type { CollectionId, DocumentId } from "@superego/backend";
import { useState } from "react";
import { PiCloudCheck, PiFloppyDisk, PiTrash } from "react-icons/pi";
import { useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { getDocumentQuery } from "../../../business-logic/backend/hooks.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import DocumentUtils from "../../../utils/DocumentUtils.js";
import ContentSummaryPropertyValue from "../../design-system/ContentSummaryPropertyValue/ContentSummaryPropertyValue.js";
import RouteLevelErrors from "../../design-system/RouteLevelErrors/RouteLevelErrors.js";
import Shell from "../../design-system/Shell/Shell.js";
import CreateNewDocumentVersionForm from "./CreateNewDocumentVersionForm.js";
import DeleteDocumentModalForm from "./DeleteDocumentModalForm.js";
import RemoteDocumentInfoModal from "./RemoteDocumentInfoModal.jsx";

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
  const [isRemoteDocumentInfoModalOpen, setIsRemoteDocumentInfoModalOpen] =
    useState(false);
  const collection = CollectionUtils.findCollection(collections, collectionId);
  return collection ? (
    <DataLoader
      queries={[getDocumentQuery([collection.id, documentId])]}
      renderLoading={() => (
        <Shell.Panel slot="Main">
          <Shell.Panel.Header
            title={intl.formatMessage(
              { defaultMessage: "{collection}" },
              { collection: CollectionUtils.getDisplayName(collection) },
            )}
          />
        </Shell.Panel>
      )}
      renderErrors={(errors) => (
        <RouteLevelErrors
          headerTitle={intl.formatMessage(
            { defaultMessage: "{collection} » {documentId}" },
            {
              collection: CollectionUtils.getDisplayName(collection),
              documentId,
            },
          )}
          errors={errors}
        />
      )}
    >
      {(document) => (
        <Shell.Panel slot="Main">
          <Shell.Panel.Header
            title={intl.formatMessage(
              { defaultMessage: "{collection} » {document}" },
              {
                collection: CollectionUtils.getDisplayName(collection),
                document: (
                  <ContentSummaryPropertyValue
                    // Key necessary due to react-intl bug #5032.
                    key={document.id}
                    value={DocumentUtils.getDisplayName(document)}
                  />
                ),
              },
            )}
            actionsAriaLabel={intl.formatMessage({
              defaultMessage: "Document actions",
            })}
            actions={
              document.remoteId === null
                ? [
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
                  ]
                : [
                    {
                      label: intl.formatMessage({
                        defaultMessage: "Remote document info",
                      }),
                      icon: <PiCloudCheck />,
                      onPress: () => setIsRemoteDocumentInfoModalOpen(true),
                    },
                  ]
            }
          />
          <Shell.Panel.Content>
            <CreateNewDocumentVersionForm
              key={createFormId}
              collection={collection}
              document={document}
              formId={createFormId}
              setSubmitDisabled={setIsCreateFormSubmitDisabled}
              isReadOnly={document.remoteId !== null}
            />
            <DeleteDocumentModalForm
              key={`DeleteDocumentModalForm_${documentId}`}
              document={document}
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
            />
            <RemoteDocumentInfoModal
              collection={collection}
              document={document}
              isOpen={isRemoteDocumentInfoModalOpen}
              onClose={() => setIsRemoteDocumentInfoModalOpen(false)}
            />
          </Shell.Panel.Content>
        </Shell.Panel>
      )}
    </DataLoader>
  ) : null;
}
