import type { Document, MinimalDocumentVersion } from "@superego/backend";
import { DateTime } from "luxon";
import { Disclosure, DisclosurePanel } from "react-aria-components";
import { FormattedDate, FormattedMessage } from "react-intl";
import { RouteName } from "../../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../../business-logic/navigation/useNavigationState.js";
import Button from "../../../design-system/Button/Button.js";
import type Bucket from "./Bucket.js";
import DocumentVersionTimelineNode from "./DocumentVersionTimelineNode.js";
import * as cs from "./History.css.js";
import TimelineDot from "./TimelineDot.js";

interface Props {
  document: Document;
  bucket: Bucket;
  onRestore: (documentVersion: MinimalDocumentVersion) => void;
  canRestore: (documentVersion: MinimalDocumentVersion) => boolean;
  timelinePosition?: "first" | "middle" | "last";
}
export default function BucketTimelineNode({
  document,
  bucket,
  onRestore,
  canRestore,
  timelinePosition = "middle",
}: Props) {
  const { activeRoute } = useNavigationState();
  const containsActiveVersion =
    activeRoute.name === RouteName.Document &&
    bucket.documentVersions.some((version) =>
      activeRoute.documentVersionId !== undefined
        ? activeRoute.documentVersionId === version.id
        : version.id === document.latestVersion.id,
    );
  return (
    <Disclosure defaultExpanded={containsActiveVersion}>
      {({ isExpanded }) => (
        <>
          <div className={cs.BucketTimelineNode.node}>
            <TimelineDot
              showDot={!isExpanded}
              position={isExpanded ? "middle" : timelinePosition}
            />
            <Button
              slot="trigger"
              variant="invisible"
              className={cs.BucketTimelineNode.trigger}
            >
              <FormattedMessage
                defaultMessage="{label} ({count} versions)"
                values={{
                  label: <BucketLabel endDate={bucket.endDate} />,
                  count: bucket.documentVersions.length,
                }}
              />
            </Button>
          </div>
          <DisclosurePanel className={cs.BucketTimelineNode.panel}>
            {bucket.documentVersions.map((documentVersion, index) => {
              const isLast = index === bucket.documentVersions.length - 1;
              return (
                <DocumentVersionTimelineNode
                  key={documentVersion.id}
                  document={document}
                  documentVersion={documentVersion}
                  onRestore={onRestore}
                  canRestore={canRestore(documentVersion)}
                  timelinePosition={
                    isLast && timelinePosition === "last" ? "last" : "middle"
                  }
                />
              );
            })}
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}

function BucketLabel({ endDate }: { endDate: Date }) {
  const endDateTime = DateTime.fromJSDate(endDate);

  // Today.
  if (endDateTime.hasSame(DateTime.now(), "day")) {
    return <FormattedMessage defaultMessage="Earlier today" />;
  }

  // Yesterday.
  if (endDateTime.hasSame(DateTime.now().minus({ days: 1 }), "day")) {
    return <FormattedMessage defaultMessage="Yesterday" />;
  }

  // Within 7 days.
  if (endDateTime > DateTime.now().minus({ days: 7 }).startOf("day")) {
    return <FormattedDate value={endDate} weekday="long" />;
  }

  // Older than 7 days.
  if (endDateTime.hasSame(DateTime.now(), "year")) {
    return <FormattedDate value={endDate} month="short" day="numeric" />;
  }

  // More than one year old.
  return (
    <FormattedDate value={endDate} month="short" day="numeric" year="numeric" />
  );
}
