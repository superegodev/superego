import type { Conversation } from "@superego/backend";
import { FormattedDate, FormattedMessage, useIntl } from "react-intl";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import { toHref } from "../../../business-logic/navigation/RouteUtils.js";
import ConversationUtils from "../../../utils/ConversationUtils.js";
import ConversationAssistant from "../../design-system/ConversationAssistant/ConversationAssistant.js";
import ConversationFormat from "../../design-system/ConversationFormat/ConversationFormat.js";
import ConversationStatus from "../../design-system/ConversationStatus/ConversationStatus.js";
import Table from "../../design-system/Table/Table.js";

interface Props {
  conversations: Omit<Conversation, "messages">[];
}
export default function ConversationsTable({ conversations }: Props) {
  const intl = useIntl();
  return (
    <Table
      aria-label={intl.formatMessage({ defaultMessage: "Conversations" })}
      selectionMode="none"
    >
      <Table.Header>
        <Table.Column isRowHeader={true}>
          <FormattedMessage defaultMessage="Title" />
        </Table.Column>
        <Table.Column>
          <FormattedMessage defaultMessage="Status" />
        </Table.Column>
        <Table.Column>
          <FormattedMessage defaultMessage="Assistant" />
        </Table.Column>
        <Table.Column>
          <FormattedMessage defaultMessage="Format" />
        </Table.Column>
        <Table.Column align="right">
          <FormattedMessage defaultMessage="Created at" />
        </Table.Column>
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
            <Table.Cell>
              <ConversationStatus status={conversation.status} />
            </Table.Cell>
            <Table.Cell>
              <ConversationAssistant assistant={conversation.assistant} />
            </Table.Cell>
            <Table.Cell>
              <ConversationFormat format={conversation.format} />
            </Table.Cell>
            <Table.Cell align="right">
              <FormattedDate value={conversation.createdAt} />
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  );
}
