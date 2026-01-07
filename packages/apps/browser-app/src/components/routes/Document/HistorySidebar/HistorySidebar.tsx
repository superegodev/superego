import type { Collection, Document, DocumentVersion } from "@superego/backend";
import { PiClockCounterClockwise, PiX } from "react-icons/pi";
import { FormattedMessage } from "react-intl";
import DataLoader from "../../../../business-logic/backend/DataLoader.js";
import { listDocumentVersionsQuery } from "../../../../business-logic/backend/hooks.js";
import { bucketVersions } from "../../../../utils/versionBucketing.js";
import IconButton from "../../../design-system/IconButton/IconButton.js";
import ThreeDotSpinner from "../../../design-system/ThreeDotSpinner/ThreeDotSpinner.js";
import { useDocumentHistory } from "../DocumentHistoryContext.js";
import * as cs from "./HistorySidebar.css.js";
import RestoreVersionButton from "./RestoreVersionButton.js";
import VersionBucket from "./VersionBucket.js";

interface Props {
  collection: Collection;
  document: Document;
  viewingVersion: DocumentVersion | null;
}

export default function HistorySidebar({
  collection,
  document,
  viewingVersion,
}: Props) {
  const {
    isHistorySidebarOpen,
    toggleHistorySidebar,
    selectedVersionId,
    selectVersion,
  } = useDocumentHistory();

  if (!isHistorySidebarOpen) {
    return null;
  }

  const handleRestored = () => {
    // Clear the selection to return to viewing the latest version
    selectVersion(null);
  };

  return (
    <aside className={cs.HistorySidebar.root}>
      <header className={cs.HistorySidebar.header}>
        <div className={cs.HistorySidebar.headerTitle}>
          <PiClockCounterClockwise />
          <FormattedMessage defaultMessage="History" />
        </div>
        <IconButton
          variant="invisible"
          label="Close history"
          className={cs.HistorySidebar.closeButton}
          onPress={toggleHistorySidebar}
        >
          <PiX />
        </IconButton>
      </header>

      <DataLoader
        queries={[listDocumentVersionsQuery([collection.id, document.id])]}
        renderLoading={() => (
          <div className={cs.HistorySidebar.content}>
            <div className={cs.HistorySidebar.loading}>
              <ThreeDotSpinner />
            </div>
          </div>
        )}
        renderErrors={() => (
          <div className={cs.HistorySidebar.content}>
            <div className={cs.HistorySidebar.error}>
              <FormattedMessage defaultMessage="Failed to load version history" />
            </div>
          </div>
        )}
      >
        {(versions) => {
          const buckets = bucketVersions(versions);
          return (
            <>
              <div className={cs.HistorySidebar.content}>
                {buckets.length === 0 ? (
                  <div className={cs.HistorySidebar.empty}>
                    <FormattedMessage defaultMessage="No version history available" />
                  </div>
                ) : (
                  buckets.map((bucket) => (
                    <VersionBucket
                      key={bucket.id}
                      bucket={bucket}
                      selectedVersionId={selectedVersionId}
                      latestVersionId={document.latestVersion.id}
                      onSelectVersion={selectVersion}
                    />
                  ))
                )}
              </div>

              <RestoreVersionButton
                collection={collection}
                document={document}
                viewingVersion={viewingVersion}
                latestCollectionVersionId={collection.latestVersion.id}
                onRestored={handleRestored}
              />
            </>
          );
        }}
      </DataLoader>
    </aside>
  );
}
