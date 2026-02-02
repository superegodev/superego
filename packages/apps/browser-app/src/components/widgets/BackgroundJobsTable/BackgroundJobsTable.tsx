import type { LiteBackgroundJob } from "@superego/backend";
import { FormattedMessage, useIntl } from "react-intl";
import ScreenSize from "../../../business-logic/screen-size/ScreenSize.js";
import useScreenSize from "../../../business-logic/screen-size/useScreenSize.js";
import Pagination from "../../design-system/Pagination/Pagination.js";
import Table from "../../design-system/Table/Table.js";
import useTablePagination from "../../design-system/Table/useTablePagination.js";
import * as cs from "./BackgroundJobsTable.css.js";
import BackgroundJobTableRow from "./BackgroundJobTableRow.js";

const PAGINATION_THRESHOLD = 500;

interface Props {
  backgroundJobs: LiteBackgroundJob[];
  pageSize: number | "max";
}
export default function BackgroundJobsTable({
  backgroundJobs,
  pageSize,
}: Props) {
  const intl = useIntl();
  const screenSize = useScreenSize();

  const {
    isPaginating,
    activePage,
    setActivePage,
    calculatedPageSize,
    totalPages,
    tableContainerRef,
    displayedItems,
  } = useTablePagination({
    items: backgroundJobs,
    pageSize,
    paginationThreshold: PAGINATION_THRESHOLD,
  });

  return (
    <div className={cs.BackgroundJobsTable.root}>
      <div
        ref={tableContainerRef}
        className={cs.BackgroundJobsTable.tableContainer}
      >
        <Table
          key={`${screenSize}`}
          aria-label={intl.formatMessage({ defaultMessage: "Background jobs" })}
          selectionMode="none"
          isEmpty={displayedItems.length === 0}
        >
          <Table.Header>
            <Table.Column isRowHeader={true} defaultWidth="3fr">
              <FormattedMessage defaultMessage="Name" />
            </Table.Column>
            <Table.Column align="center" defaultWidth="1fr">
              <FormattedMessage defaultMessage="Status" />
            </Table.Column>
            {screenSize > ScreenSize.Medium ? (
              <>
                <Table.Column defaultWidth="1fr">
                  <FormattedMessage defaultMessage="Enqueued" />
                </Table.Column>
                <Table.Column defaultWidth="1fr">
                  <FormattedMessage defaultMessage="Started" />
                </Table.Column>
                <Table.Column defaultWidth="1fr">
                  <FormattedMessage defaultMessage="Finished" />
                </Table.Column>
              </>
            ) : null}
          </Table.Header>
          <Table.Body
            items={displayedItems}
            renderEmptyState={() => (
              <Table.Empty>
                <FormattedMessage defaultMessage="There are no background jobs yet." />
              </Table.Empty>
            )}
          >
            {(backgroundJob) => (
              <BackgroundJobTableRow
                backgroundJob={backgroundJob}
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
          totalItems={backgroundJobs.length}
          className={cs.BackgroundJobsTable.pagination}
        />
      ) : null}
    </div>
  );
}
