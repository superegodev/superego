import type { DocumentVersionId, LiteDocumentVersion } from "@superego/backend";
import {
  DisclosurePanel,
  Disclosure as DisclosureRAC,
} from "react-aria-components";
import { PiCaretDown, PiCaretRight } from "react-icons/pi";
import type { VersionBucket as VersionBucketType } from "../../../../utils/versionBucketing.js";
import Button from "../../../design-system/Button/Button.js";
import * as cs from "./HistorySidebar.css.js";
import VersionItem from "./VersionItem.js";

interface Props {
  bucket: VersionBucketType;
  selectedVersionId: DocumentVersionId | null;
  latestVersionId: DocumentVersionId;
  onSelectVersion: (id: DocumentVersionId | null) => void;
}

export default function VersionBucket({
  bucket,
  selectedVersionId,
  latestVersionId,
  onSelectVersion,
}: Props) {
  const isVersionSelected = (version: LiteDocumentVersion) => {
    // If selectedVersionId is null, the latest version is selected
    if (selectedVersionId === null) {
      return version.id === latestVersionId;
    }
    return version.id === selectedVersionId;
  };

  return (
    <DisclosureRAC defaultExpanded={true} className={cs.VersionBucket.root}>
      {({ isExpanded }) => (
        <>
          <Button
            slot="trigger"
            variant="invisible"
            className={cs.VersionBucket.trigger}
          >
            <span className={cs.VersionBucket.triggerIcon}>
              {isExpanded ? <PiCaretDown /> : <PiCaretRight />}
            </span>
            {bucket.label}
          </Button>
          <DisclosurePanel className={cs.VersionBucket.panel}>
            {bucket.versions.map((version) => (
              <VersionItem
                key={version.id}
                version={version}
                isSelected={isVersionSelected(version)}
                isLatest={version.id === latestVersionId}
                onSelect={onSelectVersion}
              />
            ))}
          </DisclosurePanel>
        </>
      )}
    </DisclosureRAC>
  );
}
