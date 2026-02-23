import type { Conversation, Message } from "@superego/backend";
import { PiArrowsClockwise } from "react-icons/pi";
import { useIntl } from "react-intl";
import { useGlobalData } from "../../../../business-logic/backend/GlobalData.js";
import { useRetryLastResponse } from "../../../../business-logic/backend/hooks.js";
import last from "../../../../utils/last.js";
import IconButton from "../../../design-system/IconButton/IconButton.js";

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

  const { inference } = useGlobalData().globalSettings;
  const { isPending, mutate } = useRetryLastResponse();

  // TODO_AI:
  // - default to the same model that was used, not to the default model
  // - allow to choose a different model to retry the conversation
  return conversation.canRetryLastResponse &&
    message === last(conversation.messages) ? (
    <IconButton
      variant="invisible"
      label={
        isPending
          ? intl.formatMessage({ defaultMessage: "Retrying..." })
          : intl.formatMessage({ defaultMessage: "Retry response" })
      }
      onPress={() =>
        mutate(conversation.id, {
          providerModelRef: inference.defaults.chat!,
        })
      }
      className={className}
    >
      <PiArrowsClockwise />
    </IconButton>
  ) : null;
}
