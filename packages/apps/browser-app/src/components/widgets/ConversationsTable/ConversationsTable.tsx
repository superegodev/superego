import type { LiteConversation } from "@superego/backend";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import ScreenSize from "../../../business-logic/screen-size/ScreenSize.js";
import useScreenSize from "../../../business-logic/screen-size/useScreenSize.js";
import Pagination from "../../design-system/Pagination/Pagination.js";
import Table from "../../design-system/Table/Table.js";
import usePageSize from "../../design-system/Table/usePageSize.js";
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

  const shouldPaginate = conversations.length > PAGINATION_THRESHOLD;
  const { calculatedPageSize, containerRef } = usePageSize<HTMLDivElement>({
    pageSize: shouldPaginate ? pageSize : conversations.length,
  });
  const [activePage, setActivePage] = useState(1);
  const totalPages = shouldPaginate
    ? Math.ceil(conversations.length / calculatedPageSize)
    : 1;
  const displayedConversations = (() => {
    if (!shouldPaginate) {
      return conversations;
    }
    if (calculatedPageSize === 0) {
      return [];
    }
    const startIndex = (activePage - 1) * calculatedPageSize;
    return conversations.slice(startIndex, startIndex + calculatedPageSize);
  })();

  return (
    <div className={cs.ConversationsTable.root}>
      <div ref={containerRef} className={cs.ConversationsTable.tableContainer}>
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
            items={displayedConversations}
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
      {shouldPaginate && totalPages > 1 ? (
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
