import type { CollectionId, DocumentId } from "@superego/backend";
import { useState } from "react";
import {
  PiArrowSquareOut,
  PiClockCounterClockwise,
  PiCloudCheck,
  PiFloppyDisk,
  PiTrash,
} from "react-icons/pi";
import { useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import { getDocumentQuery } from "../../../business-logic/backend/hooks.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import DocumentUtils from "../../../utils/DocumentUtils.js";
import ContentSummaryPropertyValue from "../../design-system/ContentSummaryPropertyValue/ContentSummaryPropertyValue.js";
import RouteLevelErrors from "../../design-system/RouteLevelErrors/RouteLevelErrors.js";
import Shell from "../../design-system/Shell/Shell.js";
import DeleteDocumentModalForm from "./DeleteDocumentModalForm.js";
import * as cs from "./Document.css.js";
import DocumentContent from "./DocumentContent.js";
import {
  DocumentHistoryProvider,
  useDocumentHistory,
} from "./DocumentHistoryContext.js";
import RemoteDocumentInfoModal from "./RemoteDocumentInfoModal.js";

interface Props {
  collectionId: CollectionId;
  documentId: DocumentId;
}

export default function Document({ collectionId, documentId }: Props) {
  const { collections } = useGlobalData();
  const collection = CollectionUtils.findCollection(collections, collectionId);

  if (!collection) {
    return null;
  }

  return (
    <DocumentHistoryProvider>
      <DocumentInner collectionId={collectionId} documentId={documentId} />
    </DocumentHistoryProvider>
  );
}

function DocumentInner({ collectionId, documentId }: Props) {
  const intl = useIntl();
  const createFormId = `CreateNewDocumentVersionForm_${documentId}`;
  const [isCreateFormSubmitDisabled, setIsCreateFormSubmitDisabled] =
    useState(true);
  const { collections } = useGlobalData();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRemoteDocumentInfoModalOpen, setIsRemoteDocumentInfoModalOpen] =
    useState(false);
  const { isHistorySidebarOpen, toggleHistorySidebar, selectedVersionId } =
    useDocumentHistory();
  const collection = CollectionUtils.findCollection(collections, collectionId);

  if (!collection) {
    return null;
  }

  // When viewing a historical version, the form should be read-only
  // and the save button should be disabled
  const isViewingHistoricalVersion = selectedVersionId !== null;

  return (
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
                    value={DocumentUtils.getDisplayName(document)}
                  />
                ),
              },
            )}
            actionsAriaLabel={intl.formatMessage({
              defaultMessage: "Document actions",
            })}
            actions={[
              // History toggle - always shown (before Save/Delete per user preference)
              {
                label: intl.formatMessage({ defaultMessage: "History" }),
                icon: <PiClockCounterClockwise />,
                onPress: toggleHistorySidebar,
                className: isHistorySidebarOpen
                  ? cs.Document.historyToggleSelected
                  : undefined,
              },
              document.remoteId === null && !isViewingHistoricalVersion
                ? {
                    label: intl.formatMessage({ defaultMessage: "Save" }),
                    icon: <PiFloppyDisk />,
                    submit: createFormId,
                    isDisabled: isCreateFormSubmitDisabled,
                  }
                : null,
              document.remoteId === null
                ? {
                    label: intl.formatMessage({
                      defaultMessage: "Delete document",
                    }),
                    icon: <PiTrash />,
                    onPress: () => setIsDeleteModalOpen(true),
                  }
                : null,
              document.remoteId !== null
                ? {
                    label: intl.formatMessage({
                      defaultMessage: "Remote document info",
                    }),
                    icon: <PiCloudCheck />,
                    onPress: () => setIsRemoteDocumentInfoModalOpen(true),
                  }
                : null,
              document.remoteUrl
                ? {
                    label: intl.formatMessage({
                      defaultMessage: "Go to remote document",
                    }),
                    icon: <PiArrowSquareOut />,
                    href: document.remoteUrl,
                  }
                : null,
            ]}
          />
          <Shell.Panel.Content>
            <DocumentContent
              collection={collection}
              document={document}
              formId={createFormId}
              setSubmitDisabled={setIsCreateFormSubmitDisabled}
              isReadOnly={
                document.remoteId !== null || isViewingHistoricalVersion
              }
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
  );
}
