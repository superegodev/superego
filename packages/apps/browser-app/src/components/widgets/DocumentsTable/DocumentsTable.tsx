import type { Collection, CollectionId, LiteDocument } from "@superego/backend";
import { ContentSummaryUtils } from "@superego/shared-utils";
import { useState } from "react";
import { PiArrowSquareOut } from "react-icons/pi";
import { FormattedDate, FormattedMessage, useIntl } from "react-intl";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import { toHref } from "../../../business-logic/navigation/RouteUtils.js";
import ScreenSize from "../../../business-logic/screen-size/ScreenSize.js";
import useScreenSize from "../../../business-logic/screen-size/useScreenSize.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import isEmpty from "../../../utils/isEmpty.js";
import ContentSummaryPropertyValue from "../../design-system/ContentSummaryPropertyValue/ContentSummaryPropertyValue.js";
import Link from "../../design-system/Link/Link.js";
import Table from "../../design-system/Table/Table.js";
import * as cs from "./DocumentsTable.css.js";
import getSortDescriptor from "./getSortDescriptor.js";
import sortDocuments from "./sortDocuments.js";
import useSortableColumnIds from "./useSortableColumnIds.js";

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
  const sortedProperties = ContentSummaryUtils.getSortedProperties(
    documents.map((document) => document.latestVersion.contentSummary),
  );
  const sortableColumnIds = useSortableColumnIds();
  const [sortDescriptor, setSortDescriptor] = useState(() =>
    getSortDescriptor(sortedProperties, sortableColumnIds),
  );
  const sortedDocuments = sortDocuments(
    documents,
    sortDescriptor,
    sortableColumnIds,
  );
  return (
    <Table
      // Re-render when these props change, otherwise react-aria-components
      // crashes the table.
      key={`${screenSize}${showCreatedAt}${showLastModifiedAt}`}
      aria-label={intl.formatMessage(
        { defaultMessage: "Documents of collection {collection}" },
        { collection: collection?.settings.name ?? collectionId },
      )}
      sortDescriptor={sortDescriptor}
      onSortChange={setSortDescriptor}
      selectionMode="none"
      className={className}
    >
      <Table.Header>
        {isEmpty(sortedProperties) ? (
          <Table.Column isRowHeader={true}>
            <FormattedMessage defaultMessage="Id" />
          </Table.Column>
        ) : null}
        {sortedProperties.map((property, index) => (
          <Table.Column
            key={property.name}
            id={`${sortableColumnIds.propertyPrefix}${property.name}`}
            isRowHeader={index === 0}
            minWidth={120}
            allowsSorting={property.sortable}
          >
            {property.label}
          </Table.Column>
        ))}
        {collection && CollectionUtils.hasRemote(collection) ? (
          <Table.Column
            align="center"
            // Setting to zero makes it of minimal width.
            maxWidth={0}
          >
            <FormattedMessage defaultMessage="Go to" />
          </Table.Column>
        ) : null}
        {showCreatedAt && screenSize > ScreenSize.Medium ? (
          <Table.Column
            maxWidth={160}
            allowsSorting={true}
            id={sortableColumnIds.createdAt}
          >
            <FormattedMessage defaultMessage="Created at" />
          </Table.Column>
        ) : null}
        {showLastModifiedAt && screenSize > ScreenSize.Medium ? (
          <Table.Column
            maxWidth={160}
            allowsSorting={true}
            id={sortableColumnIds.lastModifiedAt}
          >
            <FormattedMessage defaultMessage="Last modified at" />
          </Table.Column>
        ) : null}
      </Table.Header>
      <Table.Body
        items={sortedDocuments}
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
              documentVersionId: document.latestVersion.id,
            })}
          >
            {isEmpty(sortedProperties) ? (
              <Table.Cell>{document.id}</Table.Cell>
            ) : null}
            {sortedProperties.map(({ name }) => (
              <Table.Cell key={name}>
                {document.latestVersion.contentSummary.success ? (
                  <ContentSummaryPropertyValue
                    value={document.latestVersion.contentSummary.data[name]}
                  />
                ) : document.latestVersion.contentSummary.error.name ===
                  "ContentSummaryNotValid" ? (
                  <FormattedMessage defaultMessage="Invalid content summary" />
                ) : (
                  document.latestVersion.contentSummary.error.details.message
                )}
              </Table.Cell>
            ))}
            {collection && CollectionUtils.hasRemote(collection) ? (
              <Table.Cell align="center">
                {document.remoteUrl ? (
                  <Link
                    href={document.remoteUrl}
                    target="_blank"
                    className={cs.DocumentsTable.remoteUrlLink}
                  >
                    <PiArrowSquareOut />
                  </Link>
                ) : null}
              </Table.Cell>
            ) : null}
            {showCreatedAt && screenSize > ScreenSize.Medium ? (
              <Table.Cell>
                <FormattedDate
                  value={document.createdAt}
                  dateStyle="short"
                  timeStyle="medium"
                />
              </Table.Cell>
            ) : null}
            {showLastModifiedAt && screenSize > ScreenSize.Medium ? (
              <Table.Cell>
                <FormattedDate
                  value={document.latestVersion.createdAt}
                  dateStyle="short"
                  timeStyle="medium"
                />
              </Table.Cell>
            ) : null}
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  );
}
