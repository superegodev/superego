import type { LiteConversation } from "@superego/backend";
import { FormattedMessage, useIntl } from "react-intl";
import ScreenSize from "../../../business-logic/screen-size/ScreenSize.js";
import useScreenSize from "../../../business-logic/screen-size/useScreenSize.js";
import Pagination from "../../design-system/Pagination/Pagination.js";
import Table from "../../design-system/Table/Table.js";
import useTablePagination from "../../design-system/Table/useTablePagination.js";
import * as cs from "./ConversationsTable.css.js";
import ConversationTableRow from "./ConversationTableRow.js";

const PAGINATION_THRESHOLD = 500;

interface Props {
  conversations: LiteConversation[];
  pageSize: number | "max";
}
export default function ConversationsTable({ conversations, pageSize }: Props) {
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
    items: conversations,
    pageSize,
    paginationThreshold: PAGINATION_THRESHOLD,
  });

  return (
    <div className={cs.ConversationsTable.root}>
      <div
        ref={tableContainerRef}
        className={cs.ConversationsTable.tableContainer}
      >
        <Table
          key={`${screenSize}`}
          aria-label={intl.formatMessage({ defaultMessage: "Conversations" })}
          selectionMode="none"
        >
          <Table.Header>
            <Table.Column isRowHeader={true} defaultWidth="3fr">
              <FormattedMessage defaultMessage="Title" />
            </Table.Column>
            <Table.Column align="center" defaultWidth="1fr">
              <FormattedMessage defaultMessage="Status" />
            </Table.Column>
            {screenSize > ScreenSize.Medium ? (
              <>
                <Table.Column defaultWidth="1fr">
                  <FormattedMessage defaultMessage="Assistant" />
                </Table.Column>
                <Table.Column align="right" defaultWidth="1fr">
                  <FormattedMessage defaultMessage="Created at" />
                </Table.Column>
              </>
            ) : null}
          </Table.Header>
          <Table.Body
            items={displayedItems}
            renderEmptyState={() => (
              <Table.Empty>
                <FormattedMessage defaultMessage="You don't have any conversations yet." />
              </Table.Empty>
            )}
          >
            {(conversation) => (
              <ConversationTableRow
                conversation={conversation}
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
          totalItems={conversations.length}
          className={cs.ConversationsTable.pagination}
        />
      ) : null}
    </div>
  );
}
