import type { Conversation, Message } from "@superego/backend";
import { PiArrowsClockwise } from "react-icons/pi";
import { useIntl } from "react-intl";
import { useRetryLastResponse } from "../../../../business-logic/backend/hooks.js";
import last from "../../../../utils/last.js";
import IconButton from "../../../design-system/IconButton/IconButton.jsx";

interface Props {
  conversation: Conversation;
  message: Message;
  className: string;
}
export default function RetryButton({
  conversation,
  message,
  className,
}: Props) {
  const intl = useIntl();

  const { isPending, mutate } = useRetryLastResponse();

  return conversation.canRetryLastResponse &&
    message === last(conversation.messages) ? (
    <IconButton
      variant="invisible"
      label={
        isPending
          ? intl.formatMessage({ defaultMessage: "Retrying..." })
          : intl.formatMessage({ defaultMessage: "Retry response" })
      }
      onPress={() => mutate(conversation.id)}
      className={className}
    >
      <PiArrowsClockwise />
    </IconButton>
  ) : null;
}
