import type { Collection, Document as DocumentType } from "@superego/backend";
import DataLoader from "../../../business-logic/backend/DataLoader.js";
import {
  getCollectionVersionQuery,
  getDocumentVersionQuery,
} from "../../../business-logic/backend/hooks.js";
import CreateNewDocumentVersionForm from "./CreateNewDocumentVersionForm.js";
import * as cs from "./Document.css.js";
import { useDocumentHistory } from "./DocumentHistoryContext.js";
import HistorySidebar from "./HistorySidebar/index.js";

interface Props {
  collection: Collection;
  document: DocumentType;
  formId: string;
  setSubmitDisabled: (disabled: boolean) => void;
  isReadOnly: boolean;
}

export default function DocumentContent({
  collection,
  document,
  formId,
  setSubmitDisabled,
  isReadOnly,
}: Props) {
  const { selectedVersionId, isHistorySidebarOpen } = useDocumentHistory();

  // If we're viewing a historical version, we need to fetch it
  // If selectedVersionId is null, we're viewing the latest version
  const isViewingHistoricalVersion = selectedVersionId !== null;

  if (!isViewingHistoricalVersion) {
    // Viewing the latest version - no extra loading needed
    return (
      <div className={cs.Document.contentWithSidebar}>
        <div className={cs.Document.mainContent}>
          <CreateNewDocumentVersionForm
            key={formId}
            collection={collection}
            document={document}
            formId={formId}
            setSubmitDisabled={setSubmitDisabled}
            isReadOnly={isReadOnly}
          />
        </div>
        {isHistorySidebarOpen && (
          <HistorySidebar
            collection={collection}
            document={document}
            viewingVersion={null}
          />
        )}
      </div>
    );
  }

  // Viewing a historical version - need to fetch it
  return (
    <DataLoader
      queries={[
        getDocumentVersionQuery([
          collection.id,
          document.id,
          selectedVersionId,
        ]),
      ]}
      renderLoading={() => (
        <div className={cs.Document.contentWithSidebar}>
          <div className={cs.Document.mainContent}>
            <CreateNewDocumentVersionForm
              key={formId}
              collection={collection}
              document={document}
              formId={formId}
              setSubmitDisabled={setSubmitDisabled}
              isReadOnly={true}
              isLoadingVersion={true}
            />
          </div>
          {isHistorySidebarOpen && (
            <HistorySidebar
              collection={collection}
              document={document}
              viewingVersion={null}
            />
          )}
        </div>
      )}
      renderErrors={() => (
        <div className={cs.Document.contentWithSidebar}>
          <div className={cs.Document.mainContent}>
            <CreateNewDocumentVersionForm
              key={formId}
              collection={collection}
              document={document}
              formId={formId}
              setSubmitDisabled={setSubmitDisabled}
              isReadOnly={true}
              versionLoadError={true}
            />
          </div>
          {isHistorySidebarOpen && (
            <HistorySidebar
              collection={collection}
              document={document}
              viewingVersion={null}
            />
          )}
        </div>
      )}
    >
      {(viewingVersion) => {
        // Check if we need to fetch an older collection version
        const needsOldCollectionVersion =
          viewingVersion.collectionVersionId !== collection.latestVersion.id;

        if (!needsOldCollectionVersion) {
          // Same collection schema - render with current collection
          return (
            <div className={cs.Document.contentWithSidebar}>
              <div className={cs.Document.mainContent}>
                <CreateNewDocumentVersionForm
                  key={`${formId}_${selectedVersionId}`}
                  collection={collection}
                  document={document}
                  formId={formId}
                  setSubmitDisabled={setSubmitDisabled}
                  isReadOnly={true}
                  viewingVersion={viewingVersion}
                />
              </div>
              {isHistorySidebarOpen && (
                <HistorySidebar
                  collection={collection}
                  document={document}
                  viewingVersion={viewingVersion}
                />
              )}
            </div>
          );
        }

        // Need to fetch older collection version for the schema
        return (
          <DataLoader
            queries={[
              getCollectionVersionQuery([
                collection.id,
                viewingVersion.collectionVersionId,
              ]),
            ]}
            renderLoading={() => (
              <div className={cs.Document.contentWithSidebar}>
                <div className={cs.Document.mainContent}>
                  <CreateNewDocumentVersionForm
                    key={formId}
                    collection={collection}
                    document={document}
                    formId={formId}
                    setSubmitDisabled={setSubmitDisabled}
                    isReadOnly={true}
                    isLoadingVersion={true}
                  />
                </div>
                {isHistorySidebarOpen && (
                  <HistorySidebar
                    collection={collection}
                    document={document}
                    viewingVersion={viewingVersion}
                  />
                )}
              </div>
            )}
            renderErrors={() => (
              <div className={cs.Document.contentWithSidebar}>
                <div className={cs.Document.mainContent}>
                  <CreateNewDocumentVersionForm
                    key={formId}
                    collection={collection}
                    document={document}
                    formId={formId}
                    setSubmitDisabled={setSubmitDisabled}
                    isReadOnly={true}
                    versionLoadError={true}
                  />
                </div>
                {isHistorySidebarOpen && (
                  <HistorySidebar
                    collection={collection}
                    document={document}
                    viewingVersion={viewingVersion}
                  />
                )}
              </div>
            )}
          >
            {(viewingCollectionVersion) => (
              <div className={cs.Document.contentWithSidebar}>
                <div className={cs.Document.mainContent}>
                  <CreateNewDocumentVersionForm
                    key={`${formId}_${selectedVersionId}`}
                    collection={collection}
                    document={document}
                    formId={formId}
                    setSubmitDisabled={setSubmitDisabled}
                    isReadOnly={true}
                    viewingVersion={viewingVersion}
                    viewingCollectionVersion={viewingCollectionVersion}
                  />
                </div>
                {isHistorySidebarOpen && (
                  <HistorySidebar
                    collection={collection}
                    document={document}
                    viewingVersion={viewingVersion}
                  />
                )}
              </div>
            )}
          </DataLoader>
        );
      }}
    </DataLoader>
  );
}
