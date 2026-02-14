import type {
  CollectionId,
  DocumentId,
  DocumentVersionId,
} from "@superego/backend";
import { useEffect, useState } from "react";
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
import useShell from "../../../business-logic/navigation/useShell.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import DocumentUtils from "../../../utils/DocumentUtils.js";
import ContentSummaryPropertyValue from "../../design-system/ContentSummaryPropertyValue/ContentSummaryPropertyValue.js";
import RouteLevelErrors from "../../design-system/RouteLevelErrors/RouteLevelErrors.js";
import Shell from "../../design-system/Shell/Shell.js";
import DeleteDocumentModalForm from "./DeleteDocumentModalForm.js";
import * as cs from "./Document.css.js";
import DocumentContent from "./DocumentContent.js";
import History from "./History/History.js";
import RedirectIfLatest from "./RedirectIfLatest.js";
import RemoteDocumentInfoModal from "./RemoteDocumentInfoModal.js";

interface Props {
  collectionId: CollectionId;
  documentId: DocumentId;
  documentVersionId?: DocumentVersionId;
}
export default function Document({
  collectionId,
  documentId,
  documentVersionId,
}: Props) {
  const intl = useIntl();
  const { navigateTo } = useNavigationState();
  const createFormId = `CreateNewDocumentVersionForm_${documentId}`;
  const [isCreateFormSubmitDisabled, setIsCreateFormSubmitDisabled] =
    useState(true);
  const { collections } = useGlobalData();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRemoteDocumentInfoModalOpen, setIsRemoteDocumentInfoModalOpen] =
    useState(false);
  const collection = CollectionUtils.findCollection(collections, collectionId);
  const layoutOptions =
    collection?.latestVersion.settings.defaultDocumentLayoutOptions;
  const { closePrimarySidebar, openPrimarySidebar } = useShell();
  useEffect(() => {
    if (!layoutOptions?.collapseSidebar) return;
    closePrimarySidebar();
    return () => openPrimarySidebar();
  }, [layoutOptions?.collapseSidebar, closePrimarySidebar, openPrimarySidebar]);

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
        // History is shown when documentVersionId is specified.
        const isShowingHistory = typeof documentVersionId === "string";
        return (
          <Shell.Panel slot="Main">
            <RedirectIfLatest document={document} />
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
                  icon: isShowingHistory ? (
                    <PiClockCountdownFill />
                  ) : (
                    <PiClockCountdown />
                  ),
                  onPress: () =>
                    navigateTo({
                      name: RouteName.Document,
                      collectionId,
                      documentId,
                      documentVersionId: isShowingHistory
                        ? undefined
                        : document.latestVersion.id,
                    }),
                },
                !isRemote && !isShowingHistory
                  ? {
                      label: intl.formatMessage({ defaultMessage: "Save" }),
                      icon: <PiFloppyDisk />,
                      submit: createFormId,
                      isDisabled: isCreateFormSubmitDisabled,
                    }
                  : null,
                !isRemote
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
              fullWidth={isShowingHistory || layoutOptions?.fullWidth}
              className={
                isShowingHistory ? cs.Document.historyLayout : undefined
              }
            >
              <div
                className={
                  isShowingHistory ? cs.Document.contentWrapper : undefined
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
                  readOnlyReason={
                    isRemote
                      ? "remote"
                      : isShowingHistory
                        ? "history-version"
                        : null
                  }
                />
              </div>
              {isShowingHistory ? (
                <History
                  collection={collection}
                  document={document}
                  documentVersions={documentVersions}
                  className={cs.Document.history}
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
