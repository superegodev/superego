import type {
  CollectionId,
  DocumentId,
  DocumentVersionId,
} from "@superego/backend";
import { useState } from "react";
import {
  PiArrowSquareOut,
  PiClockCountdown,
  PiClockCountdownFill,
  PiCloudCheck,
  PiFloppyDisk,
  PiTrash,
} from "react-icons/pi";
import { useIntl } from "react-intl";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import { useGlobalData } from "../../../business-logic/backend/GlobalData.js";
import {
  getDocumentQuery,
  listDocumentVersionsQuery,
} from "../../../business-logic/backend/hooks.js";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../business-logic/navigation/useNavigationState.js";
import ScreenSize from "../../../business-logic/screen-size/ScreenSize.js";
import useScreenSize from "../../../business-logic/screen-size/useScreenSize.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import DocumentUtils from "../../../utils/DocumentUtils.js";
import ContentSummaryPropertyValue from "../../design-system/ContentSummaryPropertyValue/ContentSummaryPropertyValue.js";
import RouteLevelErrors from "../../design-system/RouteLevelErrors/RouteLevelErrors.js";
import Shell from "../../design-system/Shell/Shell.js";
import DeleteDocumentModalForm from "./DeleteDocumentModalForm.js";
import * as cs from "./Document.css.js";
import DocumentContent from "./DocumentContent.js";
import History from "./History/History.js";
import RemoteDocumentInfoModal from "./RemoteDocumentInfoModal.js";

interface Props {
  collectionId: CollectionId;
  documentId: DocumentId;
  showHistory?: boolean;
  documentVersionId?: DocumentVersionId;
}
export default function Document({
  collectionId,
  documentId,
  showHistory = false,
  documentVersionId,
}: Props) {
  const intl = useIntl();
  const { navigateTo } = useNavigationState();
  const screenSize = useScreenSize();
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
      queries={[
        getDocumentQuery([collection.id, documentId]),
        listDocumentVersionsQuery([collection.id, documentId]),
      ]}
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
      {(document, documentVersions) => {
        const isRemote = document.remoteId !== null;
        const isLatestVersion = !(
          typeof documentVersionId === "string" &&
          documentVersionId !== document.latestVersion.id
        );
        return (
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
                {
                  label: intl.formatMessage({ defaultMessage: "History" }),
                  icon: showHistory ? (
                    <PiClockCountdownFill />
                  ) : (
                    <PiClockCountdown />
                  ),
                  onPress: () =>
                    navigateTo({
                      name: RouteName.Document,
                      collectionId,
                      documentId,
                      showHistory: !showHistory,
                    }),
                },
                !isRemote && isLatestVersion
                  ? {
                      label: intl.formatMessage({ defaultMessage: "Save" }),
                      icon: <PiFloppyDisk />,
                      submit: createFormId,
                      isDisabled: isCreateFormSubmitDisabled,
                    }
                  : null,
                !isRemote === null
                  ? {
                      label: intl.formatMessage({
                        defaultMessage: "Delete document",
                      }),
                      icon: <PiTrash />,
                      onPress: () => setIsDeleteModalOpen(true),
                    }
                  : null,
                isRemote
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
            <Shell.Panel.Content
              fullWidth={showHistory || !isLatestVersion}
              className={
                showHistory || !isLatestVersion
                  ? cs.Document.historyLayout
                  : undefined
              }
            >
              {screenSize > ScreenSize.Small ||
              (!showHistory && isLatestVersion) ? (
                <div
                  className={
                    showHistory || !isLatestVersion
                      ? cs.Document.contentWrapper
                      : undefined
                  }
                >
                  <DocumentContent
                    collection={collection}
                    document={document}
                    documentVersions={documentVersions}
                    documentVersionId={
                      documentVersionId ?? document.latestVersion.id
                    }
                    formId={createFormId}
                    setSubmitDisabled={setIsCreateFormSubmitDisabled}
                    isReadOnly={isRemote || !isLatestVersion}
                  />
                </div>
              ) : null}
              {showHistory || !isLatestVersion ? (
                <History
                  collection={collection}
                  document={document}
                  documentVersions={documentVersions}
                />
              ) : null}
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
        );
      }}
    </DataLoader>
  ) : null;
}
