import type { Collection, CollectionId, LiteDocument } from "@superego/backend";
import { uniq } from "es-toolkit";
import { FormattedDate, FormattedMessage, useIntl } from "react-intl";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import { toHref } from "../../../business-logic/navigation/RouteUtils.js";
import ScreenSize from "../../../business-logic/screen-size/ScreenSize.js";
import useScreenSize from "../../../business-logic/screen-size/useScreenSize.js";
import DocumentUtils from "../../../utils/DocumentUtils.js";
import isEmpty from "../../../utils/isEmpty.js";
import Table from "../../design-system/Table/Table.js";

interface Props {
  collectionId: CollectionId;
  collection: Collection | null;
  documents: LiteDocument[];
  showCreatedAt?: boolean | undefined;
  showLastModifiedAt?: boolean | undefined;
  className?: string | undefined;
}
export default function DocumentsTable({
  collectionId,
  collection,
  documents,
  showCreatedAt,
  showLastModifiedAt,
  className,
}: Props) {
  const intl = useIntl();
  const screenSize = useScreenSize();
  const contentSummaryKeys = uniq(
    documents.flatMap((document) =>
      Object.keys(document.latestVersion.contentSummary.data ?? {}),
    ),
  ).sort();
  return (
    <Table
      key={screenSize}
      aria-label={intl.formatMessage(
        { defaultMessage: "Documents of collection {collection}" },
        { collection: collection?.settings.name ?? collectionId },
      )}
      selectionMode="none"
      className={className}
    >
      <Table.Header>
        {isEmpty(contentSummaryKeys) ? (
          <Table.Column isRowHeader={true}>
            <FormattedMessage defaultMessage="Id" />
          </Table.Column>
        ) : null}
        {contentSummaryKeys.map((contentSummaryKey, index) => (
          <Table.Column
            key={contentSummaryKey}
            isRowHeader={index === 0}
            minWidth={120}
          >
            {DocumentUtils.formatContentSummaryKey(contentSummaryKey)}
          </Table.Column>
        ))}
        {showCreatedAt && screenSize > ScreenSize.Medium ? (
          <Table.Column align="right">
            <FormattedMessage defaultMessage="Created at" />
          </Table.Column>
        ) : null}
        {showLastModifiedAt && screenSize > ScreenSize.Medium ? (
          <Table.Column align="right">
            <FormattedMessage defaultMessage="Last modified at" />
          </Table.Column>
        ) : null}
      </Table.Header>
      <Table.Body
        items={documents}
        renderEmptyState={() => (
          <Table.Empty>
            <FormattedMessage defaultMessage="This collection doesn't have any documents yet." />
          </Table.Empty>
        )}
      >
        {(document) => (
          <Table.Row
            href={toHref({
              name: RouteName.Document,
              collectionId: collectionId,
              documentId: document.id,
            })}
          >
            {isEmpty(contentSummaryKeys) ? (
              <Table.Cell>{document.id}</Table.Cell>
            ) : null}
            {contentSummaryKeys.map((key) => (
              <Table.Cell key={key}>
                {document.latestVersion.contentSummary.success ? (
                  document.latestVersion.contentSummary.data[key]
                ) : document.latestVersion.contentSummary.error.name ===
                  "ContentSummaryNotValid" ? (
                  <FormattedMessage defaultMessage="Invalid content summary" />
                ) : (
                  document.latestVersion.contentSummary.error.details.message
                )}
              </Table.Cell>
            ))}
            {showCreatedAt && screenSize > ScreenSize.Medium ? (
              <Table.Cell align="right">
                <FormattedDate value={document.createdAt} />
              </Table.Cell>
            ) : null}
            {showLastModifiedAt && screenSize > ScreenSize.Medium ? (
              <Table.Cell align="right">
                <FormattedDate value={document.latestVersion.createdAt} />
              </Table.Cell>
            ) : null}
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  );
}
