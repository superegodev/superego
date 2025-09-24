import type { Collection, CollectionId, LiteDocument } from "@superego/backend";
import {
  type ContentSummaryProperty,
  ContentSummaryUtils,
} from "@superego/shared-utils";
import { sortBy } from "es-toolkit";
import { useState } from "react";
import type { SortDescriptor } from "react-aria-components";
import { FormattedDate, FormattedMessage, useIntl } from "react-intl";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import { toHref } from "../../../business-logic/navigation/RouteUtils.js";
import ScreenSize from "../../../business-logic/screen-size/ScreenSize.js";
import useScreenSize from "../../../business-logic/screen-size/useScreenSize.js";
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
  const sortedProperties = ContentSummaryUtils.getSortedProperties(
    documents.map((document) => document.latestVersion.contentSummary),
  );
  const [sortDescriptor, setSortDescriptor] = useState(() =>
    getSortDescriptor(sortedProperties),
  );
  const sortedDocuments = sortBy(documents, [
    (document: LiteDocument) =>
      sortDescriptor
        ? document.latestVersion.contentSummary.success
          ? document.latestVersion.contentSummary.data[sortDescriptor.column]
          : "ZZZ"
        : document.id,
  ]);
  if (!sortDescriptor || sortDescriptor.direction === "descending") {
    sortedDocuments.reverse();
  }
  return (
    <Table
      key={screenSize}
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
            isRowHeader={index === 0}
            minWidth={120}
            allowsSorting={property.sortable}
          >
            {property.label}
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
                  document.latestVersion.contentSummary.data[name]
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

function getSortDescriptor(
  properties: ContentSummaryProperty[],
): SortDescriptor | undefined {
  for (const { name, defaultSort } of properties) {
    if (defaultSort !== null) {
      return {
        column: name,
        direction: defaultSort === "asc" ? "ascending" : "descending",
      };
    }
  }
  return properties[0]
    ? { column: properties[0].name, direction: "ascending" }
    : undefined;
}
