import type { DocumentVersionId, LiteDocumentVersion } from "@superego/backend";
import { ContentSummaryUtils } from "@superego/shared-utils";
import { FormattedMessage, useIntl } from "react-intl";
import ContentSummaryPropertyValue from "../../../design-system/ContentSummaryPropertyValue/ContentSummaryPropertyValue.js";
import * as cs from "./HistorySidebar.css.js";

interface Props {
  version: LiteDocumentVersion;
  isSelected: boolean;
  isLatest: boolean;
  onSelect: (id: DocumentVersionId | null) => void;
}

export default function VersionItem({
  version,
  isSelected,
  isLatest,
  onSelect,
}: Props) {
  const intl = useIntl();
  const date = new Date(version.createdAt);

  const handleClick = () => {
    // If clicking on already selected version, or on latest when null is selected
    if (isSelected) {
      return;
    }
    // Select null for latest version, otherwise the version id
    onSelect(isLatest ? null : version.id);
  };

  const formattedTime = intl.formatTime(date, {
    hour: "numeric",
    minute: "2-digit",
  });

  const formattedDate = intl.formatDate(date, {
    month: "short",
    day: "numeric",
  });

  // Get the first property of the content summary to display
  const getContentSummaryPreview = () => {
    if (!version.contentSummary.success) {
      return null;
    }
    const properties = ContentSummaryUtils.getSortedProperties([
      version.contentSummary,
    ]);
    if (properties.length === 0) {
      return null;
    }
    const firstProperty = properties[0]!;
    return (
      <ContentSummaryPropertyValue
        value={version.contentSummary.data[firstProperty.name]}
      />
    );
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={cs.VersionItem.root[isSelected ? "selected" : "default"]}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className={cs.VersionItem.header}>
        <span className={cs.VersionItem.timestamp}>
          {formattedTime} · {formattedDate}
        </span>
        {isLatest ? (
          <span className={cs.VersionItem.currentBadge}>
            <FormattedMessage defaultMessage="Current" />
          </span>
        ) : null}
      </div>
      {version.contentSummary.success ? (
        <div className={cs.VersionItem.contentSummary}>
          {getContentSummaryPreview()}
        </div>
      ) : null}
    </div>
  );
}
