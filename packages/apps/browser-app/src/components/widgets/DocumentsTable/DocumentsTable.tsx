import type { Collection, CollectionId, LiteDocument } from "@superego/backend";
import { ContentSummaryUtils } from "@superego/shared-utils";
import { useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import ScreenSize from "../../../business-logic/screen-size/ScreenSize.js";
import useScreenSize from "../../../business-logic/screen-size/useScreenSize.js";
import CollectionUtils from "../../../utils/CollectionUtils.js";
import classnames from "../../../utils/classnames.js";
import isEmpty from "../../../utils/isEmpty.js";
import Pagination from "../../design-system/Pagination/Pagination.js";
import Table from "../../design-system/Table/Table.js";
import useTablePagination from "../../design-system/Table/useTablePagination.js";
import * as cs from "./DocumentsTable.css.js";
import DocumentTableRow from "./DocumentTableRow.js";
import getSortDescriptor from "./getSortDescriptor.js";
import sortDocuments from "./sortDocuments.js";
import useSortableColumnIds from "./useSortableColumnIds.js";

const PAGINATION_THRESHOLD = 500;

interface Props {
  collectionId: CollectionId;
  collection: Collection | null;
  documents: LiteDocument[];
  pageSize: number | "max";
  alwaysPaginate?: boolean | undefined;
  showCreatedAt?: boolean | undefined;
  showLastModifiedAt?: boolean | undefined;
  className?: string | undefined;
  tableClassName?: string | undefined;
}
export default function DocumentsTable({
  collectionId,
  collection,
  documents,
  pageSize,
  alwaysPaginate = false,
  showCreatedAt,
  showLastModifiedAt,
  className,
  tableClassName,
}: Props) {
  const intl = useIntl();
  const screenSize = useScreenSize();
  const sortedProperties = useMemo(
    () =>
      ContentSummaryUtils.getSortedProperties(
        documents.map((document) => document.latestVersion.contentSummary),
      ),
    [documents],
  );
  const sortableColumnIds = useSortableColumnIds();
  const [sortDescriptor, setSortDescriptor] = useState(() =>
    getSortDescriptor(sortedProperties, sortableColumnIds),
  );
  const sortedDocuments = useMemo(
    () => sortDocuments(documents, sortDescriptor, sortableColumnIds),
    [documents, sortDescriptor, sortableColumnIds],
  );

  const {
    isPaginating,
    activePage,
    setActivePage,
    calculatedPageSize,
    totalPages,
    tableContainerRef,
    displayedItems,
  } = useTablePagination({
    items: sortedDocuments,
    pageSize,
    alwaysPaginate,
    paginationThreshold: PAGINATION_THRESHOLD,
  });

  return (
    <div className={classnames(cs.DocumentsTable.root, className)}>
      <div ref={tableContainerRef} className={cs.DocumentsTable.tableContainer}>
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
          isEmpty={displayedItems.length === 0}
          className={classnames(cs.DocumentsTable.table, tableClassName)}
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
                maxWidth={150}
                allowsSorting={true}
                id={sortableColumnIds.createdAt}
              >
                <FormattedMessage defaultMessage="Created at" />
              </Table.Column>
            ) : null}
            {showLastModifiedAt && screenSize > ScreenSize.Medium ? (
              <Table.Column
                maxWidth={150}
                allowsSorting={true}
                id={sortableColumnIds.lastModifiedAt}
              >
                <FormattedMessage defaultMessage="Last modified at" />
              </Table.Column>
            ) : null}
          </Table.Header>
          <Table.Body
            items={displayedItems}
            renderEmptyState={() => (
              <Table.Empty>
                <FormattedMessage defaultMessage="This collection doesn't have any documents yet." />
              </Table.Empty>
            )}
          >
            {(document) => (
              <DocumentTableRow
                collectionId={collectionId}
                collection={collection}
                document={document}
                sortedProperties={sortedProperties}
                showCreatedAt={showCreatedAt}
                showLastModifiedAt={showLastModifiedAt}
                screenSize={screenSize}
              />
            )}
          </Table.Body>
        </Table>
      </div>
      {isPaginating && totalPages > 1 ? (
        <Pagination
          totalPages={totalPages}
          activePage={activePage}
          onActivePageChange={setActivePage}
          pageSize={calculatedPageSize}
          totalItems={sortedDocuments.length}
          className={cs.DocumentsTable.pagination}
        />
      ) : null}
    </div>
  );
}
