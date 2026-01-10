import type { Document, MinimalDocumentVersion } from "@superego/backend";
import { PiChatCircle, PiClockCounterClockwise } from "react-icons/pi";
import { FormattedDate, useIntl } from "react-intl";
import { RouteName } from "../../../../business-logic/navigation/Route.js";
import useNavigationState from "../../../../business-logic/navigation/useNavigationState.js";
import IconButton from "../../../design-system/IconButton/IconButton.js";
import IconLink from "../../../design-system/IconLink/IconLink.js";
import Link from "../../../design-system/Link/Link.js";
import CreatedByLine from "./CreatedByLine.js";
import * as cs from "./History.css.js";
import TimelineDot from "./TimelineDot.js";

interface Props {
  document: Document;
  documentVersion: MinimalDocumentVersion;
  onRestore: (documentVersion: MinimalDocumentVersion) => void;
  canRestore: boolean;
  timelinePosition?: "first" | "middle" | "last" | "only";
}
export default function DocumentVersionTimelineNode({
  document,
  documentVersion,
  onRestore,
  canRestore,
  timelinePosition = "middle",
}: Props) {
  const intl = useIntl();
  const { activeRoute } = useNavigationState();

  const isLatest = documentVersion.id === document.latestVersion.id;

  const isActive =
    activeRoute.name === RouteName.Document &&
    (activeRoute.documentVersionId === undefined
      ? isLatest
      : activeRoute.documentVersionId === documentVersion.id);

  return (
    <div data-active={isActive} className={cs.DocumentVersionTimelineNode.root}>
      <TimelineDot position={timelinePosition} />
      <Link
        to={{
          name: RouteName.Document,
          collectionId: document.collectionId,
          documentId: document.id,
          documentVersionId: documentVersion.id,
          showHistory:
            activeRoute.name === RouteName.Document
              ? activeRoute.showHistory
              : undefined,
        }}
        className={cs.DocumentVersionTimelineNode.link}
      >
        <div className={cs.DocumentVersionTimelineNode.createdAt}>
          <FormattedDate
            value={documentVersion.createdAt}
            dateStyle="medium"
            timeStyle="medium"
          />
        </div>
        <CreatedByLine createdBy={documentVersion.createdBy} />
      </Link>
      <div className={cs.DocumentVersionTimelineNode.actions}>
        {documentVersion.conversationId ? (
          <IconLink
            variant="invisible"
            label={intl.formatMessage({ defaultMessage: "Go to conversation" })}
            to={{
              name: RouteName.Conversation,
              conversationId: documentVersion.conversationId,
            }}
            className={cs.DocumentVersionTimelineNode.actionButton}
          >
            <PiChatCircle />
          </IconLink>
        ) : null}
        {!isLatest ? (
          <IconButton
            variant="invisible"
            label={intl.formatMessage({ defaultMessage: "Restore version" })}
            onPress={() => onRestore(documentVersion)}
            isDisabled={!canRestore}
            className={cs.DocumentVersionTimelineNode.actionButton}
          >
            <PiClockCounterClockwise />
          </IconButton>
        ) : null}
      </div>
    </div>
  );
}
