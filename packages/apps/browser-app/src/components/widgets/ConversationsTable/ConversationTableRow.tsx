import type { LiteConversation } from "@superego/backend";
import { FormattedDate, useIntl } from "react-intl";
import { RouteName } from "../../../business-logic/navigation/Route.js";
import { toHref } from "../../../business-logic/navigation/RouteUtils.js";
import ScreenSize from "../../../business-logic/screen-size/ScreenSize.js";
import ConversationUtils from "../../../utils/ConversationUtils.js";
import ConversationAssistant from "../../design-system/ConversationAssistant/ConversationAssistant.js";
import ConversationStatus from "../../design-system/ConversationStatus/ConversationStatus.js";
import Table from "../../design-system/Table/Table.js";

interface Props {
  conversation: LiteConversation;
  screenSize: ScreenSize;
}
export default function ConversationTableRow({
  conversation,
  screenSize,
}: Props) {
  const intl = useIntl();
  return (
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
  );
}
