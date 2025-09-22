import {
  type Conversation,
  type Message,
  MessageRole,
} from "@superego/backend";
import { FormattedMessage, useIntl } from "react-intl";
import formatDuration from "../../../utils/formatDuration.js";
import type Milliseconds from "../../../utils/Milliseconds.js";

interface Props {
  message: Message.ContentAssistant;
  conversation: Conversation;
}
export default function ThinkingTime({ message, conversation }: Props) {
  const intl = useIntl();
  const thinkingTime = getThinkingTime(message, conversation);
  return thinkingTime ? (
    <FormattedMessage
      defaultMessage={"Thought for {time}"}
      values={{ time: formatDuration(thinkingTime, intl) }}
    />
  ) : null;
}

function getThinkingTime(
  message: Message.ContentAssistant,
  conversation: Conversation,
): Milliseconds | null {
  const indexOfMessage = conversation.messages.indexOf(message);
  let previousUserMessage: Message.User | null = null;
  for (let i = indexOfMessage; i >= 0; i--) {
    const previousMessage = conversation.messages[i];
    if (previousMessage?.role === MessageRole.User) {
      previousUserMessage = previousMessage;
      break;
    }
  }
  return previousUserMessage
    ? message.createdAt.getTime() - previousUserMessage.createdAt.getTime()
    : null;
}
