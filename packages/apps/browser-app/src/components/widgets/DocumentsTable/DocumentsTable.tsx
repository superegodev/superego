import type { Collection, CollectionId, LiteDocument } from "@superego/backend";
import { ContentSummaryUtils } from "@superego/shared-utils";
import { useState } from "react";
import { FormattedDate, FormattedMessage, useIntl } from "react-intl";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import { toHref } from "../../../business-logic/navigation/RouteUtils.js";
import ScreenSize from "../../../business-logic/screen-size/ScreenSize.js";
import useScreenSize from "../../../business-logic/screen-size/useScreenSize.js";
import isEmpty from "../../../utils/isEmpty.js";
import ContentSummaryPropertyValue from "../../design-system/ContentSummaryPropertyValue/ContentSummaryPropertyValue.jsx";
import Table from "../../design-system/Table/Table.js";
import getSortDescriptor from "./getSortDescriptor.js";
import sortDocuments from "./sortDocuments.js";
import useColumnIds from "./useColumnIds.js";

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
  const columnIds = useColumnIds();
  const [sortDescriptor, setSortDescriptor] = useState(() =>
    getSortDescriptor(sortedProperties, columnIds),
  );
  const sortedDocuments = sortDocuments(documents, sortDescriptor, columnIds);
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
            id={`${columnIds.propertyPrefix}${property.name}`}
            isRowHeader={index === 0}
            minWidth={120}
            allowsSorting={property.sortable}
          >
            {property.label}
          </Table.Column>
        ))}
        {showCreatedAt && screenSize > ScreenSize.Medium ? (
          <Table.Column
            maxWidth={160}
            allowsSorting={true}
            id={columnIds.createdAt}
          >
            <FormattedMessage defaultMessage="Created at" />
          </Table.Column>
        ) : null}
        {showLastModifiedAt && screenSize > ScreenSize.Medium ? (
          <Table.Column
            maxWidth={160}
            allowsSorting={true}
            id={columnIds.lastModifiedAt}
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
