import type { LiteConversation } from "@superego/backend";
import { FormattedDate, FormattedMessage, useIntl } from "react-intl";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import { toHref } from "../../../business-logic/navigation/RouteUtils.js";
import ScreenSize from "../../../business-logic/screen-size/ScreenSize.js";
import useScreenSize from "../../../business-logic/screen-size/useScreenSize.js";
import ConversationUtils from "../../../utils/ConversationUtils.js";
import ConversationAssistant from "../../design-system/ConversationAssistant/ConversationAssistant.js";
import ConversationStatus from "../../design-system/ConversationStatus/ConversationStatus.js";
import Table from "../../design-system/Table/Table.js";
import * as cs from "./ConversationsTable.css.js";

interface Props {
  conversations: LiteConversation[];
}
export default function ConversationsTable({ conversations }: Props) {
  const intl = useIntl();
  const screenSize = useScreenSize();
  return (
    <Table
      aria-label={intl.formatMessage({ defaultMessage: "Conversations" })}
      selectionMode="none"
      className={cs.ConversationsTable.root}
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
        items={conversations}
        renderEmptyState={() => (
          <Table.Empty>
            <FormattedMessage defaultMessage="You don't have any conversations yet." />
          </Table.Empty>
        )}
      >
        {(conversation) => (
          <Table.Row
            href={toHref({
              name: RouteName.Conversation,
              conversationId: conversation.id,
            })}
          >
            <Table.Cell>
              {ConversationUtils.getDisplayTitle(conversation, intl)}
            </Table.Cell>
            <Table.Cell align="center">
              <ConversationStatus status={conversation.status} />
            </Table.Cell>
            {screenSize > ScreenSize.Medium ? (
              <>
                <Table.Cell>
                  <ConversationAssistant assistant={conversation.assistant} />
                </Table.Cell>
                <Table.Cell align="right">
                  <FormattedDate value={conversation.createdAt} />
                </Table.Cell>
              </>
            ) : null}
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  );
}
